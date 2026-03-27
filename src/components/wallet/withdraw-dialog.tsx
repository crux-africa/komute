"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Minus, Building2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { formatNaira } from "@/lib/utils";
import { createPortal } from "react-dom";

interface WithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balance: number;
  onSuccess: () => void;
}

interface Bank {
  id: number;
  name: string;
  code: string;
  longcode: string;
  type: string;
  active: boolean;
}

export function WithdrawDialog({ open, onOpenChange, balance, onSuccess }: WithdrawDialogProps) {
  const [amount, setAmount] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [loading, setLoading] = useState(false);
  const [validatingAccount, setValidatingAccount] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Fetch banks on mount
  useEffect(() => {
    setMounted(true);
    fetchBanks();
  }, []);

  async function fetchBanks() {
    setLoadingBanks(true);
    try {
      const res = await fetch("/api/banks");
      const data = await res.json();
      
      if (data.success) {
        setBanks(data.banks);
      } else if (data.fallback) {
        // Use fallback list if API fails
        setBanks(data.banks);
        toast.info("Using offline bank list");
      }
    } catch (error) {
      console.error("Error fetching banks:", error);
      toast.error("Failed to load banks");
    } finally {
      setLoadingBanks(false);
    }
  }

  const amountInKobo = amount ? parseInt(amount) * 100 : 0;
  const isValidAmount = amountInKobo >= 100000; // Minimum ₦1,000
  const canWithdraw = isValidAmount && balance >= amountInKobo && bankCode && accountNumber.length === 10;

  async function validateAccount() {
    if (accountNumber.length !== 10 || !bankCode) {
      toast.error("Please enter a valid 10-digit account number and select a bank");
      return;
    }

    setValidatingAccount(true);
    try {
      const res = await fetch(`/api/wallet/validate-account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountNumber, bankCode }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setAccountName(data.accountName);
        toast.success("Account verified!");
      } else {
        setAccountName("");
        toast.error(data.error || "Invalid account details");
      }
    } catch (error) {
      console.error("Account validation error:", error);
      toast.error("Failed to validate account");
    } finally {
      setValidatingAccount(false);
    }
  }

  async function handleWithdraw() {
    if (!canWithdraw) {
      if (amountInKobo > balance) {
        toast.error("Insufficient balance");
      }
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountInKobo,
          bankCode,
          accountNumber,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Withdrawal failed");
      }

      toast.success("Withdrawal initiated!", {
        description: `₦${parseInt(amount).toLocaleString()} will be sent to ${data.accountName} within 5-10 minutes.`,
      });

      onSuccess();
      onOpenChange(false);
      setAmount("");
      setAccountNumber("");
      setAccountName("");
      setBankCode("");
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast.error(error instanceof Error ? error.message : "Withdrawal failed");
    } finally {
      setLoading(false);
    }
  }

  if (!mounted || !open) return null;

  const dialogContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={() => onOpenChange(false)} />

      {/* Modal */}
      <div className="relative bg-background rounded-lg shadow-xl max-w-md w-full border max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Minus className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold">Withdraw to Bank</h2>
                <p className="font-body text-xs text-muted-foreground">
                  Transfer to your bank account
                </p>
              </div>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          {/* Balance Info */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="font-body text-sm text-muted-foreground">Available Balance</span>
              <span className="font-heading text-xl font-bold text-foreground">
                {formatNaira(balance)}
              </span>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2 mb-6">
            <Label htmlFor="amount" className="text-sm font-medium">
              Amount to Withdraw
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ₦
              </span>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7 h-12 text-lg font-semibold"
                min="1000"
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Minimum: ₦1,000</span>
              {amount && (
                <span className="text-muted-foreground">
                  {formatNaira(amountInKobo)} will be deducted
                </span>
              )}
            </div>
            {amount && amountInKobo > balance && (
              <div className="flex items-center gap-2 text-destructive text-xs">
                <AlertCircle className="h-3 w-3" />
                Insufficient balance
              </div>
            )}
          </div>

          {/* Bank Selection */}
          <div className="space-y-2 mb-4">
            <Label htmlFor="bank" className="text-sm font-medium">
              Select Bank
            </Label>
            <select
              id="bank"
              value={bankCode}
              onChange={(e) => setBankCode(e.target.value)}
              disabled={loadingBanks}
              className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">
                {loadingBanks ? "Loading banks..." : "Choose your bank"}
              </option>
              {banks.map((bank) => (
                <option key={bank.code} value={bank.code}>
                  {bank.name}
                </option>
              ))}
            </select>
          </div>

          {/* Account Number */}
          <div className="space-y-2 mb-4">
            <Label htmlFor="account" className="text-sm font-medium">
              Account Number
            </Label>
            <div className="flex gap-2">
              <Input
                id="account"
                type="text"
                placeholder="0123456789"
                value={accountNumber}
                onChange={(e) => {
                  setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10));
                  setAccountName("");
                }}
                className="h-12 text-lg font-semibold tracking-wider"
                maxLength={10}
              />
              <Button
                variant="outline"
                onClick={validateAccount}
                disabled={validatingAccount || accountNumber.length !== 10 || !bankCode}
                className="h-12 px-4"
              >
                {validatingAccount ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Verify"
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter 10-digit account number
            </p>
          </div>

          {/* Account Name */}
          {accountName && (
            <div className="bg-forest/10 border border-forest/20 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-forest" />
                <div>
                  <p className="font-body text-xs text-muted-foreground">Account Name</p>
                  <p className="font-heading text-sm font-bold text-forest">{accountName}</p>
                </div>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="bg-blue-500/10 rounded-lg p-3 mb-6">
            <p className="font-body text-xs text-blue-600">
              💡 Transfers are processed instantly. Processing fee: ₦0.00
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleWithdraw}
              disabled={loading || !canWithdraw || !accountName}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Minus className="mr-2 h-4 w-4" />
                  Withdraw {amount ? `₦${parseInt(amount).toLocaleString()}` : ""}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(dialogContent, document.body);
}
