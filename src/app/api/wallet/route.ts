import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getOrCreateWallet, getWalletTransactions } from "@/lib/wallet";
import { initiatePaystackRefund } from "@/lib/paystack";

// GET /api/wallet — Get wallet details
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wallet = await getOrCreateWallet(user.id);

    // Get analytics
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get recent transactions for this month
    const [thisMonthTransactions, lastMonthTransactions] = await Promise.all([
      prisma.walletTransaction.findMany({
        where: {
          walletId: wallet.id,
          createdAt: { gte: thirtyDaysAgo },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.walletTransaction.findMany({
        where: {
          walletId: wallet.id,
          createdAt: {
            gte: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
            lt: thirtyDaysAgo,
          },
        },
      }),
    ]);

    // Calculate this month stats
    const thisMonthDeposits = thisMonthTransactions
      .filter((t) => t.amount > 0 && (t.type === "DEPOSIT" || t.type === "TRANSFER_IN"))
      .reduce((sum, t) => sum + t.amount, 0);

    const thisMonthWithdrawals = thisMonthTransactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const lastMonthDeposits = lastMonthTransactions
      .filter((t) => t.amount > 0 && (t.type === "DEPOSIT" || t.type === "TRANSFER_IN"))
      .reduce((sum, t) => sum + t.amount, 0);

    const lastMonthWithdrawals = lastMonthTransactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Calculate growth
    const depositGrowth =
      lastMonthDeposits > 0
        ? ((thisMonthDeposits - lastMonthDeposits) / lastMonthDeposits) * 100
        : 0;

    const withdrawalGrowth =
      lastMonthWithdrawals > 0
        ? ((thisMonthWithdrawals - lastMonthWithdrawals) / lastMonthWithdrawals) * 100
        : 0;

    // Get ride savings
    const bookingsThisMonth = await prisma.booking.findMany({
      where: {
        riderId: user.id,
        status: { in: ["CONFIRMED", "COMPLETED"] },
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    const totalSpent = bookingsThisMonth.reduce((sum, b) => sum + b.totalPrice, 0);
    const boltEstimate = totalSpent * 3;
    const savedThisMonth = boltEstimate - totalSpent;

    // Get recent transactions
    const recentTransactions = await getWalletTransactions(wallet.id, { limit: 10 });

    return NextResponse.json({
      wallet: {
        id: wallet.id,
        balance: wallet.balance,
        totalDeposited: wallet.totalDeposited,
        totalWithdrawn: wallet.totalWithdrawn,
        totalEarned: wallet.totalEarned,
        totalSpent: wallet.totalSpent,
        totalSaved: wallet.totalSaved,
      },
      analytics: {
        thisMonth: {
          deposits: thisMonthDeposits,
          withdrawals: thisMonthWithdrawals,
          depositGrowth: depositGrowth,
          withdrawalGrowth: withdrawalGrowth,
          savings: savedThisMonth,
          transactionsCount: thisMonthTransactions.length,
        },
        lastMonth: {
          deposits: lastMonthDeposits,
          withdrawals: lastMonthWithdrawals,
        },
      },
      recentTransactions: recentTransactions.transactions,
    });
  } catch (error) {
    console.error("Error fetching wallet:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet details" },
      { status: 500 }
    );
  }
}
