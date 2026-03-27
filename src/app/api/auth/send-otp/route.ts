import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendWhatsAppOTP } from "@/lib/interswitch";
import { sendOTPviaEmail } from "@/lib/email";
import { generateOTP, getOTPExpiry } from "@/lib/auth";
import { z } from "zod";

const sendOtpSchema = z.object({
  phone: z.string().min(11).max(14),
  email: z.email().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = sendOtpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { phone, email } = validation.data;

    // Rate limit: max 3 OTPs per phone per 10 minutes
    const recentOtps = await prisma.otp.count({
      where: {
        phone,
        createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) },
      },
    });

    if (recentOtps >= 3) {
      return NextResponse.json(
        { error: "Too many OTP requests. Please wait 10 minutes." },
        { status: 429 }
      );
    }

    // Invalidate any existing unused OTPs for this phone
    await prisma.otp.updateMany({
      where: { phone, isUsed: false },
      data: { isUsed: true },
    });

    // Generate OTP
    const code = generateOTP();
    const expiresAt = getOTPExpiry();

    // Store OTP in database
    await prisma.otp.create({
      data: {
        phone,
        code,
        purpose: "LOGIN",
        expiresAt,
      },
    });

    // Try Interswitch WhatsApp first
    const iswResult = await sendWhatsAppOTP(phone, code);

    let deliveryChannel = "whatsapp";

    if (iswResult.success) {
      // WhatsApp succeeded
      if (email) {
        const emailResult = await sendOTPviaEmail(email, code);
        if (emailResult.success) {
          deliveryChannel = "email";
        }
      }
    } else {
      // WhatsApp failed, try email fallback
      if (email) {
        const emailResult = await sendOTPviaEmail(email, code);
        if (emailResult.success) {
          deliveryChannel = "email";
        } else {
          console.error("Email fallback also failed:", emailResult.error);
          deliveryChannel = "none";
        }
      } else {
        deliveryChannel = "none";
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone },
      select: { id: true, isOnboarded: true },
    });

    return NextResponse.json({
      message:
        deliveryChannel === "whatsapp"
          ? "Code sent via WhatsApp"
          : deliveryChannel === "email"
            ? "Code sent to your email"
            : "Code generated",
      channel: deliveryChannel,
      isExistingUser: !!existingUser,
      isOnboarded: existingUser?.isOnboarded ?? false,

      ...(process.env.NODE_ENV === "development" && { _devOtp: code }),
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Failed to send OTP. Please try again." },
      { status: 500 }
    );
  }
}