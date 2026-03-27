import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getOrCreateWallet, debitWallet } from "@/lib/wallet";
import { validateBankAccount } from "@/lib/interswitch";
import { sendMoney } from "@/lib/interswitch";

// POST /api/wallet/withdraw — Withdraw funds to bank account
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { amount, bankCode, accountNumber } = body;

    if (!amount || amount < 100000) {
      // Minimum 1000 Naira
      return NextResponse.json(
        { error: "Minimum withdrawal is ₦1,000" },
        { status: 400 }
      );
    }

    if (!bankCode || !accountNumber) {
      return NextResponse.json(
        { error: "Bank code and account number are required" },
        { status: 400 }
      );
    }

    // Get wallet
    const wallet = await getOrCreateWallet(user.id);

    // Check balance
    if (wallet.balance < amount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    // Validate bank account
    const accountValidation = await validateBankAccount(accountNumber, bankCode);
    if (!accountValidation.success) {
      return NextResponse.json(
        { error: "Invalid bank account details" },
        { status: 400 }
      );
    }

    // Initiate transfer
    const reference = `WALLET_WD_${user.id}_${Date.now()}`;
    const transferResult = await sendMoney({
      amount,
      accountNumber,
      bankCode,
      senderName: "Komute",
      senderPhone: "+2348000000000",
      beneficiaryName: accountValidation.accountName || "Unknown",
    });

    if (!transferResult.success) {
      return NextResponse.json(
        { error: transferResult.error || "Transfer failed" },
        { status: 500 }
      );
    }

    // Debit wallet
    await debitWallet(
      wallet.id,
      user.id,
      amount,
      "WITHDRAWAL",
      reference,
      `Withdrawal to ${accountValidation.accountName} (${accountNumber})`,
      {
        bankCode,
        accountNumber,
        accountName: accountValidation.accountName,
        transferRef: transferResult.transactionRef,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Withdrawal successful",
      reference,
      transactionRef: transferResult.transactionRef,
      amount,
      accountName: accountValidation.accountName,
    });
  } catch (error) {
    console.error("Error processing withdrawal:", error);
    return NextResponse.json(
      { error: "Failed to process withdrawal" },
      { status: 500 }
    );
  }
}
