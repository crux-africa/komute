import prisma from "@/lib/prisma";

/**
 * Get or create wallet for a user
 */
export async function getOrCreateWallet(userId: string) {
  let wallet = await prisma.wallet.findUnique({
    where: { userId },
  });

  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: {
        userId,
        balance: 0,
      },
    });
  }

  return wallet;
}

/**
 * Add funds to wallet (called after successful payment)
 */
export async function creditWallet(
  walletId: string,
  userId: string,
  amount: number,
  type: "DEPOSIT" | "REFUND" | "TRANSFER_IN" | "RIDE_EARNING",
  reference: string,
  description: string,
  provider?: "paystack" | "interswitch",
  metadata?: Record<string, unknown>
) {
  const wallet = await prisma.wallet.findUnique({
    where: { id: walletId },
  });

  if (!wallet) {
    throw new Error("Wallet not found");
  }

  const balanceBefore = wallet.balance;
  const balanceAfter = balanceBefore + amount;

  // Update wallet balance and total deposited
  await prisma.wallet.update({
    where: { id: walletId },
    data: {
      balance: balanceAfter,
      totalDeposited: type === "DEPOSIT" ? wallet.totalDeposited + amount : wallet.totalDeposited,
      totalEarned: type === "RIDE_EARNING" ? wallet.totalEarned + amount : wallet.totalEarned,
    },
  });

  // Create transaction record
  const transaction = await prisma.walletTransaction.create({
    data: {
      walletId,
      userId,
      type,
      amount,
      balanceBefore,
      balanceAfter,
      status: "COMPLETED",
      reference,
      description,
      paymentProvider: provider,
      metadata: metadata ? JSON.stringify(metadata) : null,
      completedAt: new Date(),
    },
  });

  return { transaction, balanceAfter };
}

/**
 * Debit funds from wallet
 */
export async function debitWallet(
  walletId: string,
  userId: string,
  amount: number,
  type: "WITHDRAWAL" | "BOOKING_PAYMENT" | "TRANSFER_OUT",
  reference: string,
  description: string,
  metadata?: Record<string, unknown>
) {
  const wallet = await prisma.wallet.findUnique({
    where: { id: walletId },
  });

  if (!wallet) {
    throw new Error("Wallet not found");
  }

  if (wallet.balance < amount) {
    throw new Error("Insufficient balance");
  }

  const balanceBefore = wallet.balance;
  const balanceAfter = balanceBefore - amount;

  // Update wallet balance
  await prisma.wallet.update({
    where: { id: walletId },
    data: {
      balance: balanceAfter,
      totalWithdrawn: type === "WITHDRAWAL" ? wallet.totalWithdrawn + amount : wallet.totalWithdrawn,
      totalSpent: type === "BOOKING_PAYMENT" ? wallet.totalSpent + amount : wallet.totalSpent,
    },
  });

  // Create transaction record
  const transaction = await prisma.walletTransaction.create({
    data: {
      walletId,
      userId,
      type,
      amount: -amount, // Negative for debit
      balanceBefore,
      balanceAfter,
      status: "COMPLETED",
      reference,
      description,
      metadata: metadata ? JSON.stringify(metadata) : null,
      completedAt: new Date(),
    },
  });

  return { transaction, balanceAfter };
}

/**
 * Record savings (difference between regular transport cost and Komute cost)
 */
export async function recordSavings(
  userId: string,
  savedAmount: number,
  rideId: string
) {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
  });

  if (wallet) {
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        totalSaved: wallet.totalSaved + savedAmount,
      },
    });
  }
}

/**
 * Get wallet transactions with pagination
 */
export async function getWalletTransactions(
  walletId: string,
  options: {
    type?: "DEPOSIT" | "WITHDRAWAL" | "REFUND" | "BOOKING_PAYMENT" | "TRANSFER_IN" | "TRANSFER_OUT" | "RIDE_EARNING";
    status?: "PENDING" | "COMPLETED" | "FAILED" | "REVERSED";
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
  } = {}
) {
  const {
    type,
    status,
    limit = 20,
    offset = 0,
    startDate,
    endDate,
  } = options;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { walletId };

  if (type) {
    where.type = type;
  }

  if (status) {
    where.status = status;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = startDate;
    }
    if (endDate) {
      where.createdAt.lte = endDate;
    }
  }

  const [transactions, total] = await Promise.all([
    prisma.walletTransaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.walletTransaction.count({ where }),
  ]);

  return { transactions, total };
}
