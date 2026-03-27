"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FundWalletDialog } from "@/components/wallet/fund-wallet-dialog";
import { WithdrawDialog } from "@/components/wallet/withdraw-dialog";
import { TransferDialog } from "@/components/wallet/transfer-dialog";
import {
  Wallet,
  TrendingUp,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  History,
  Plus,
  Minus,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import { formatNaira } from "@/lib/utils";
import Link from "next/link";

interface WalletData {
  wallet: {
    id: string;
    balance: number;
    totalDeposited: number;
    totalWithdrawn: number;
    totalEarned: number;
    totalSpent: number;
    totalSaved: number;
  };
  analytics: {
    thisMonth: {
      deposits: number;
      withdrawals: number;
      depositGrowth: number;
      withdrawalGrowth: number;
      savings: number;
      transactionsCount: number;
    };
    lastMonth: {
      deposits: number;
      withdrawals: number;
    };
  };
  recentTransactions: Array<{
    id: string;
    type: string;
    amount: number;
    description: string;
    status: string;
    createdAt: string;
  }>;
}

export default function SavingsPage() {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fundDialogOpen, setFundDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);

  useEffect(() => {
    fetchWallet();

    // Listen for wallet fund success event
    function handleWalletFunded() {
      fetchWallet();
    }

    window.addEventListener("walletFunded", handleWalletFunded);
    return () => window.removeEventListener("walletFunded", handleWalletFunded);
  }, []);

  function fetchWallet() {
    async function doFetch() {
      try {
        const res = await fetch("/api/wallet");
        if (res.ok) {
          const data = await res.json();
          setWalletData(data);
        }
      } catch (error) {
        console.error("Error fetching wallet:", error);
      } finally {
        setLoading(false);
      }
    }
    doFetch();
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl">
        <Skeleton className="h-32" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!walletData) {
    return (
      <Card className="max-w-6xl">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="font-heading text-lg font-semibold mb-2">
            Wallet not available
          </p>
          <p className="font-body text-sm text-muted-foreground">
            Please try again later
          </p>
        </CardContent>
      </Card>
    );
  }

  const { wallet, analytics, recentTransactions } = walletData;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Main Wallet Card */}
      <Card className="border-amber/30 bg-gradient-to-br from-amber/10 to-amber/5 dark:from-amber/5 dark:to-amber/10">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="font-body text-sm text-muted-foreground mb-1">
                Wallet Balance
              </p>
              <p className="font-heading text-5xl font-extrabold text-foreground">
                {formatNaira(wallet.balance)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                className="bg-forest hover:bg-forest/90"
                onClick={() => setFundDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Fund Wallet
              </Button>
              <Button 
                variant="outline"
                onClick={() => setWithdrawDialogOpen(true)}
              >
                <Minus className="h-4 w-4 mr-2" />
                Withdraw
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-background/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <ArrowDownRight className="h-4 w-4 text-forest" />
                <span className="font-body text-xs text-muted-foreground">
                  Total Deposited
                </span>
              </div>
              <p className="font-heading text-lg font-bold">
                {formatNaira(wallet.totalDeposited)}
              </p>
            </div>
            <div className="bg-background/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <ArrowUpRight className="h-4 w-4 text-destructive" />
                <span className="font-body text-xs text-muted-foreground">
                  Total Withdrawn
                </span>
              </div>
              <p className="font-heading text-lg font-bold">
                {formatNaira(wallet.totalWithdrawn)}
              </p>
            </div>
            <div className="bg-background/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-amber" />
                <span className="font-body text-xs text-muted-foreground">
                  Total Earned
                </span>
              </div>
              <p className="font-heading text-lg font-bold">
                {formatNaira(wallet.totalEarned)}
              </p>
            </div>
            <div className="bg-background/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <PiggyBank className="h-4 w-4 text-forest" />
                <span className="font-body text-xs text-muted-foreground">
                  Total Saved
                </span>
              </div>
              <p className="font-heading text-lg font-bold text-forest dark:text-forest-light">
                {formatNaira(wallet.totalSaved)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* This Month Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-heading">
              <BarChart3 className="h-5 w-5" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-forest" />
                  <span className="font-body text-sm">Deposits</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-bold">
                    {formatNaira(analytics.thisMonth.deposits)}
                  </span>
                  {analytics.thisMonth.depositGrowth > 0 && (
                    <Badge className="bg-forest/10 text-forest text-xs">
                      +{analytics.thisMonth.depositGrowth.toFixed(0)}%
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-destructive" />
                  <span className="font-body text-sm">Withdrawals</span>
                </div>
                <span className="font-heading font-bold">
                  {formatNaira(analytics.thisMonth.withdrawals)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-amber" />
                  <span className="font-body text-sm">Savings</span>
                </div>
                <span className="font-heading font-bold text-amber">
                  {formatNaira(analytics.thisMonth.savings)}
                </span>
              </div>
            </div>
            <div className="pt-3 border-t">
              <p className="font-body text-xs text-muted-foreground">
                {analytics.thisMonth.transactionsCount} transactions this month
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Savings vs Regular Transport */}
        <Card className="border-forest/30 bg-forest/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-heading">
              <PiggyBank className="h-5 w-5 text-forest" />
              Your Savings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="font-body text-xs text-muted-foreground mb-1">
                Total saved vs regular transport
              </p>
              <p className="font-heading text-3xl font-extrabold text-forest dark:text-forest-light">
                {formatNaira(wallet.totalSaved)}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-body text-muted-foreground">
                  Total spent on Komute
                </span>
                <span className="font-heading font-semibold">
                  {formatNaira(wallet.totalSpent)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-body text-muted-foreground">
                  Would&apos;ve cost on Bolt/Taxi
                </span>
                <span className="font-heading font-semibold">
                  {formatNaira(wallet.totalSpent * 3)}
                </span>
              </div>
            </div>
            <p className="font-body text-xs text-center text-muted-foreground">
              You saved 3x by using Komute!
            </p>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-heading">
              <RefreshCw className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setFundDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Fund Wallet
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setWithdrawDialogOpen(true)}
            >
              <Minus className="h-4 w-4 mr-2" />
              Withdraw to Bank
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setTransferDialogOpen(true)}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Transfer to User
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/rider/savings/transactions">
                <History className="h-4 w-4 mr-2" />
                View All Transactions
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-heading">
            <History className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/rider/savings/transactions">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <History className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="font-heading text-sm font-semibold mb-1">
                No transactions yet
              </p>
              <p className="font-body text-xs text-muted-foreground">
                Start by funding your wallet or booking your first ride
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        tx.amount > 0
                          ? "bg-forest/10 text-forest"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {tx.amount > 0 ? (
                        <ArrowDownRight className="h-5 w-5" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-body text-sm font-semibold">
                        {tx.description}
                      </p>
                      <p className="font-body text-xs text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleDateString("en-NG", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-heading font-bold ${
                        tx.amount > 0 ? "text-forest" : "text-destructive"
                      }`}
                    >
                      {tx.amount > 0 ? "+" : ""}
                      {formatNaira(Math.abs(tx.amount))}
                    </p>
                    <Badge
                      className={`text-xs ${
                        tx.status === "COMPLETED"
                          ? "bg-forest/10 text-forest"
                          : "bg-amber/10 text-amber"
                      }`}
                    >
                      {tx.status.toLowerCase()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fund Wallet Dialog */}
      <FundWalletDialog
        open={fundDialogOpen}
        onOpenChange={setFundDialogOpen}
        onSuccess={fetchWallet}
      />

      {/* Withdraw Dialog */}
      <WithdrawDialog
        open={withdrawDialogOpen}
        onOpenChange={setWithdrawDialogOpen}
        balance={wallet.balance}
        onSuccess={fetchWallet}
      />

      {/* Transfer Dialog */}
      <TransferDialog
        open={transferDialogOpen}
        onOpenChange={setTransferDialogOpen}
        balance={wallet.balance}
        onSuccess={fetchWallet}
      />
    </div>
  );
}
