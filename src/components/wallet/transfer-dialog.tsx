"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, RefreshCw, User, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { formatNaira } from "@/lib/utils";
import { createPortal } from "react-dom";

interface TransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balance: number;
  onSuccess: () => void;
}

export function TransferDialog({ open, onOpenChange, balance, onSuccess }: TransferDialogProps) {
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [validatingUser, setValidatingUser] = useState(false);
  const [userVerified, setUserVerified] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const amountInKobo = amount ? parseInt(amount) * 100 : 0;
  const isValidAmount = amountInKobo >= 1000; // Minimum ₦10
  const canTransfer = isValidAmount && balance >= amountInKobo && userVerified;

  async function validateUser() {
    if (recipientPhone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setValidatingUser(true);
    try {
      const res = await fetch(`/api/wallet/find-user?phone=${recipientPhone}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setRecipientName(data.user.name || data.user.phone);
        setRecipientId(data.user.id);
        setUserVerified(true);
        toast.success("User found!");
      } else {
        setRecipientName("");
        setRecipientId("");
        setUserVerified(false);
        toast.error(data.error || "User not found. Please check the phone number.");
      }
    } catch (error) {
      console.error("User validation error:", error);
      toast.error("Failed to find user");
    } finally {
      setValidatingUser(false);
    }
  }

  async function handleTransfer() {
    if (!canTransfer) {
      if (amountInKobo > balance) {
        toast.error("Insufficient balance");
      }
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/wallet/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: recipientId,
          amount: amountInKobo,
          note: note.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Transfer failed");
      }

      toast.success("Transfer successful!", {
        description: `${formatNaira(amountInKobo)} sent to ${recipientName}`,
      });

      onSuccess();
      onOpenChange(false);
      setAmount("");
      setRecipientPhone("");
      setRecipientName("");
      setRecipientId("");
      setNote("");
      setUserVerified(false);
    } catch (error) {
      console.error("Transfer error:", error);
      toast.error(error instanceof Error ? error.message : "Transfer failed");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    onOpenChange(false);
    setAmount("");
    setRecipientPhone("");
    setRecipientName("");
    setRecipientId("");
    setNote("");
    setUserVerified(false);
  }

  if (!mounted || !open) return null;

  const dialogContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-background rounded-lg shadow-xl max-w-md w-full border max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold">Transfer to User</h2>
                <p className="font-body text-xs text-muted-foreground">
                  Send money to another Komute user
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
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

          {/* Recipient Phone */}
          <div className="space-y-2 mb-4">
            <Label htmlFor="phone" className="text-sm font-medium">
              Recipient Phone Number
            </Label>
            <div className="flex gap-2">
              <Input
                id="phone"
                type="tel"
                placeholder="08012345678"
                value={recipientPhone}
                onChange={(e) => {
                  setRecipientPhone(e.target.value.replace(/\D/g, ""));
                  setUserVerified(false);
                  setRecipientName("");
                  setRecipientId("");
                }}
                className="h-12 text-base font-semibold"
              />
              <Button
                variant="outline"
                onClick={validateUser}
                disabled={validatingUser || recipientPhone.length < 10}
                className="h-12 px-4"
              >
                {validatingUser ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Find"
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter recipient&apos;s phone number registered on Komute
            </p>
          </div>

          {/* Verified User */}
          {userVerified && recipientName && (
            <div className="bg-forest/10 border border-forest/20 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-forest" />
                <div className="flex-1">
                  <p className="font-body text-xs text-muted-foreground">Recipient</p>
                  <p className="font-heading text-sm font-bold text-forest">{recipientName}</p>
                </div>
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div className="space-y-2 mb-4">
            <Label htmlFor="amount" className="text-sm font-medium">
              Amount to Transfer
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
                min="10"
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Minimum: ₦10</span>
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

          {/* Note (Optional) */}
          <div className="space-y-2 mb-6">
            <Label htmlFor="note" className="text-sm font-medium">
              Add a note (optional)
            </Label>
            <Input
              id="note"
              placeholder="What's it for?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="h-12"
              maxLength={100}
            />
          </div>

          {/* Info */}
          <div className="bg-purple-500/10 rounded-lg p-3 mb-6">
            <p className="font-body text-xs text-purple-600">
              💡 Transfers are instant and free. Recipient must be a registered Komute user.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleTransfer}
              disabled={loading || !canTransfer}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Send {amount ? `₦${parseInt(amount).toLocaleString()}` : ""}
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
