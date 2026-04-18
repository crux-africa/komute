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

    const { phone, code, email } = validation.data;

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

    if (otp.attempts >= otp.maxAttempts) {
      return NextResponse.json(
        { error: "Too many failed attempts. Request a new OTP." },
        { status: 429 }
      );
    }

    await prisma.otp.update({
      where: { id: otp.id },
      data: { isUsed: true },
    });

    let user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { phone, email: email || undefined },
      });
    } else if (email && !user.email) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { email },
      });
    }

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
      redirectTo: user.isOnboarded
        ? user.roles.includes("DRIVER") ? "/driver" : "/rider"
        : "/onboarding",
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Verification failed. Please try again.";
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}
