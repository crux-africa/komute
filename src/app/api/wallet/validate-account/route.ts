import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { validateBankAccount } from "@/lib/interswitch";

// POST /api/wallet/validate-account — Validate bank account
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { accountNumber, bankCode } = body;

    if (!accountNumber || accountNumber.length !== 10) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit account number" },
        { status: 400 }
      );
    }

    if (!bankCode) {
      return NextResponse.json(
        { error: "Please select a bank" },
        { status: 400 }
      );
    }

    // Validate account with Interswitch
    const result = await validateBankAccount(accountNumber, bankCode);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Invalid account details" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      accountName: result.accountName,
      message: "Account verified successfully",
    });
  } catch (error) {
    console.error("Account validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate account" },
      { status: 500 }
    );
  }
}
