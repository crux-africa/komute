import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getOrCreateWallet, creditWallet } from "@/lib/wallet";
import { verifyTransaction } from "@/lib/interswitch";

// POST /api/wallet/verify-isw/[reference] — Verify Interswitch payment and credit wallet
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ reference: string }> | { reference: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await Promise.resolve(params);
    const reference = resolvedParams.reference;
    const body = await req.json();
    const { amount } = body;

    // Verify payment with Interswitch
    const verification = await verifyTransaction(reference, amount);

    if (!verification.success) {
      return NextResponse.json(
        { error: verification.error || "Payment verification failed" },
        { status: 400 }
      );
    }

    // Get or create wallet
    const wallet = await getOrCreateWallet(user.id);

    // Credit wallet
    const result = await creditWallet(
      wallet.id,
      user.id,
      amount,
      "DEPOSIT",
      reference,
      `Wallet deposit via Interswitch`,
      "interswitch"
    );

    return NextResponse.json({
      success: true,
      message: "Wallet funded successfully",
      balance: result.balanceAfter,
      amount,
    });
  } catch (error) {
    console.error("Error verifying Interswitch payment:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
