import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/wallet/find-user?phone=xxx — Find user by phone
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number required" },
        { status: 400 }
      );
    }

    // Format phone number
    let formattedPhone = phone.replace(/\D/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "234" + formattedPhone.slice(1);
    }
    if (!formattedPhone.startsWith("234")) {
      formattedPhone = "234" + formattedPhone;
    }

    // Find user by phone
    const recipient = await prisma.user.findFirst({
      where: {
        phone: formattedPhone,
        isActive: true,
      },
      select: {
        id: true,
        phone: true,
        name: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!recipient) {
      return NextResponse.json(
        { error: "User not found. Please check the phone number." },
        { status: 404 }
      );
    }

    // Don't allow sending to yourself
    if (recipient.id === user.id) {
      return NextResponse.json(
        { error: "You cannot transfer to yourself" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: recipient.id,
        name: recipient.name || `${recipient.firstName || ""} ${recipient.lastName || ""}`.trim(),
        phone: recipient.phone,
      },
    });
  } catch (error) {
    console.error("Find user error:", error);
    return NextResponse.json(
      { error: "Failed to find user" },
      { status: 500 }
    );
  }
}
