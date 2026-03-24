import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { verifyOtpSchema } from "@/lib/validations/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = verifyOtpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { phone, code } = validation.data;

    // Find the most recent valid OTP for this phone
    const otp = await prisma.otp.findFirst({
      where: {
        phone,
        code,
        isUsed: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 401 }
      );
    }

    // Check max attempts
    if (otp.attempts >= otp.maxAttempts) {
      return NextResponse.json(
        { error: "Too many failed attempts. Request a new OTP." },
        { status: 429 }
      );
    }

    // Mark OTP as used
    await prisma.otp.update({
      where: { id: otp.id },
      data: { isUsed: true },
    });

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { phone },
      });
    }

    // Create session (sets JWT cookie)
    await createSession(user.id);


    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        isOnboarded: user.isOnboarded,
        roles: user.roles,
      },
      redirectTo: user.isOnboarded ? "/rider" : "/onboarding",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}