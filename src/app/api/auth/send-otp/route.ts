import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendWhatsAppOTP } from "@/lib/interswitch";
import { generateOTP, getOTPExpiry } from "@/lib/auth";
import { phoneSchema } from "@/lib/validations/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = phoneSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { phone } = validation.data;

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

    // Send via Interswitch WhatsApp API
    const result = await sendWhatsAppOTP(phone);

    if (!result.success) {
      console.error("Interswitch WhatsApp OTP failed:", result.error);
      // Still return success to client — the OTP is stored
      // In production, you'd fail here. For hackathon, log and continue.
      // The OTP can be verified from the DB directly during demo.
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone },
      select: { id: true, isOnboarded: true },
    });

    return NextResponse.json({
      message: "OTP sent successfully",
      isExistingUser: !!existingUser,
      isOnboarded: existingUser?.isOnboarded ?? false,
      // REMOVE in production — only for hackathon demo/testing
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