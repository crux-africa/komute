"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpRight, ArrowDownRight, History, Filter } from "lucide-react";
import { formatNaira } from "@/lib/utils";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  status: string;
  reference: string;
  description: string;
  paymentProvider?: string;
  completedAt?: string;
  createdAt: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<string>("all");
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    fetchTransactions(true);
  }, [filter]);

  async function fetchTransactions(reset = false) {
    if (reset) {
      setLoading(true);
      setOffset(0);
    } else {
      setLoadingMore(true);
    }

    try {
      const params = new URLSearchParams({
        limit: "20",
        offset: reset ? "0" : String(offset),
      });

      if (filter !== "all") {
        params.append("type", filter);
      }

      const res = await fetch(`/api/wallet/transactions?${params}`);
      if (res.ok) {
        const data = await res.json();
        if (reset) {
          setTransactions(data.transactions);
        } else {
          setTransactions((prev) => [...prev, ...data.transactions]);
        }
        setHasMore(data.hasMore);
        setTotal(data.total);
        setOffset(reset ? data.transactions.length : offset + data.transactions.length);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  function handleFilterChange(value: string) {
    setFilter(value);
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Transaction History</h1>
          <p className="font-body text-sm text-muted-foreground">
            {total} transaction{total !== 1 ? "s" : ""} total
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="DEPOSIT">Deposits</SelectItem>
              <SelectItem value="WITHDRAWAL">Withdrawals</SelectItem>
              <SelectItem value="TRANSFER_IN">Transfers In</SelectItem>
              <SelectItem value="TRANSFER_OUT">Transfers Out</SelectItem>
              <SelectItem value="BOOKING_PAYMENT">Booking Payments</SelectItem>
              <SelectItem value="REFUND">Refunds</SelectItem>
              <SelectItem value="RIDE_EARNING">Ride Earnings</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Transactions List */}
      {transactions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <History className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <p className="font-heading text-lg font-semibold mb-2">
              No transactions found
            </p>
            <p className="font-body text-sm text-muted-foreground text-center max-w-sm">
              {filter !== "all"
                ? "No transactions match your current filter. Try changing the filter."
                : "Start by funding your wallet or booking your first ride."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-2">
            {transactions.map((tx) => (
              <Card key={tx.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          tx.amount > 0
                            ? "bg-forest/10 text-forest"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {tx.amount > 0 ? (
                          <ArrowDownRight className="h-6 w-6" />
                        ) : (
                          <ArrowUpRight className="h-6 w-6" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm font-semibold truncate">
                          {tx.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className="text-xs font-normal"
                          >
                            {formatTransactionType(tx.type)}
                          </Badge>
                          {tx.paymentProvider && (
                            <Badge variant="outline" className="text-xs font-normal">
                              via {tx.paymentProvider}
                            </Badge>
                          )}
                          <span className="font-body text-xs text-muted-foreground">
                            {formatDate(tx.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p
                        className={`font-heading text-lg font-bold ${
                          tx.amount > 0 ? "text-forest" : "text-destructive"
                        }`}
                      >
                        {tx.amount > 0 ? "+" : ""}
                        {formatNaira(Math.abs(tx.amount))}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          className={`text-xs ${
                            tx.status === "COMPLETED"
                              ? "bg-forest/10 text-forest"
                              : tx.status === "PENDING"
                              ? "bg-amber/10 text-amber"
                              : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {tx.status.toLowerCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Balance Change */}
                  <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                    <span className="font-body text-muted-foreground">
                      Balance: {formatNaira(tx.balanceBefore)} → {formatNaira(tx.balanceAfter)}
                    </span>
                    <span className="font-body text-muted-foreground font-mono text-[10px]">
                      Ref: {tx.reference}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => fetchTransactions(false)}
                disabled={loadingMore}
              >
                {loadingMore ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function formatTransactionType(type: string): string {
  const labels: Record<string, string> = {
    DEPOSIT: "Deposit",
    WITHDRAWAL: "Withdrawal",
    TRANSFER_IN: "Transfer In",
    TRANSFER_OUT: "Transfer Out",
    BOOKING_PAYMENT: "Booking Payment",
    REFUND: "Refund",
    RIDE_EARNING: "Ride Earning",
  };
  return labels[type] || type;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString("en-NG", {
      hour: "numeric",
      minute: "2-digit",
    });
  } else if (days === 1) {
    return "Yesterday";
  } else if (days < 7) {
    return `${days} days ago`;
  } else {
    return date.toLocaleDateString("en-NG", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }
}
