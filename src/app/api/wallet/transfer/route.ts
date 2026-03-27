import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getOrCreateWallet, debitWallet, creditWallet } from "@/lib/wallet";

// POST /api/wallet/transfer — Transfer to another user
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { recipientId, amount, note } = body;

    if (!recipientId) {
      return NextResponse.json(
        { error: "Recipient required" },
        { status: 400 }
      );
    }

    if (!amount || amount < 1000) {
      // Minimum ₦10
      return NextResponse.json(
        { error: "Minimum transfer is ₦10" },
        { status: 400 }
      );
    }

    // Don't allow sending to yourself
    if (recipientId === user.id) {
      return NextResponse.json(
        { error: "You cannot transfer to yourself" },
        { status: 400 }
      );
    }

    // Verify recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
    });

    if (!recipient) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      );
    }

    // Get sender's wallet
    const senderWallet = await getOrCreateWallet(user.id);

    // Check balance
    if (senderWallet.balance < amount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    // Get or create recipient's wallet
    const recipientWallet = await getOrCreateWallet(recipientId);

    // Generate reference
    const reference = `TRANSFER_${user.id}_${recipientId}_${Date.now()}`;

    // Use transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Debit sender
      const senderTx = await tx.walletTransaction.create({
        data: {
          walletId: senderWallet.id,
          userId: user.id,
          type: "TRANSFER_OUT",
          amount: -amount,
          balanceBefore: senderWallet.balance,
          balanceAfter: senderWallet.balance - amount,
          status: "COMPLETED",
          reference,
          description: `Transfer to ${recipient.name || recipient.phone} ${note ? `- ${note}` : ""}`,
          completedAt: new Date(),
        },
      });

      // Update sender balance
      await tx.wallet.update({
        where: { id: senderWallet.id },
        data: { balance: senderWallet.balance - amount },
      });

      // Credit recipient
      const recipientTx = await tx.walletTransaction.create({
        data: {
          walletId: recipientWallet.id,
          userId: recipientId,
          type: "TRANSFER_IN",
          amount,
          balanceBefore: recipientWallet.balance,
          balanceAfter: recipientWallet.balance + amount,
          status: "COMPLETED",
          reference,
          description: `Transfer from ${user.name || user.phone} ${note ? `- ${note}` : ""}`,
          completedAt: new Date(),
        },
      });

      // Update recipient balance
      await tx.wallet.update({
        where: { id: recipientWallet.id },
        data: { balance: recipientWallet.balance + amount },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Transfer successful",
      reference,
      amount,
      recipient: {
        id: recipient.id,
        name: recipient.name || recipient.phone,
      },
    });
  } catch (error) {
    console.error("Transfer error:", error);
    return NextResponse.json(
      { error: "Transfer failed" },
      { status: 500 }
    );
  }
}
