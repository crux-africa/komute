import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getOrCreateWallet, creditWallet } from "@/lib/wallet";

// POST /api/wallet/fund — Fund wallet with payment
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { amount, provider = "paystack" } = body;

    if (!amount || amount < 10000) {
      // Minimum 100 Naira
      return NextResponse.json(
        { error: "Minimum deposit is ₦100" },
        { status: 400 }
      );
    }

    const wallet = await getOrCreateWallet(user.id);
    const reference = `WALLET_FUND_${user.id}_${Date.now()}`;

    // For now, we'll use Paystack inline
    // In production, you would initialize payment here
    return NextResponse.json({
      success: true,
      reference,
      amount,
      provider,
      message: "Payment initialized. Complete payment to fund wallet.",
      // In production, this would include Paystack/Interswitch payment details
      paymentDetails: {
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        amount,
        email: user.email || `user_${user.id}@komute.app`,
        reference,
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/wallet/verify/${reference}`,
      },
    });
  } catch (error) {
    console.error("Error initiating fund:", error);
    return NextResponse.json(
      { error: "Failed to initiate payment" },
      { status: 500 }
    );
  }
}
