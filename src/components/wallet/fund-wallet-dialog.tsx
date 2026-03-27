"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, CreditCard, Wallet as WalletIcon } from "lucide-react";
import { toast } from "sonner";
import { formatNaira } from "@/lib/utils";
import { createPortal } from "react-dom";

declare global {
  interface Window {
    PaystackPop?: {
      setup: (config: {
        key: string;
        email: string;
        amount: number;
        currency: string;
        ref: string;
        metadata?: Record<string, unknown>;
        callback: (response: { reference: string; status: string; message: string }) => void;
        onClose: () => void;
      }) => {
        openIframe: () => void;
      };
    };
    webpayCheckout?: (config: Record<string, unknown>) => void;
    komuteWalletCallback?: (response: { resp: string; desc: string; txnref?: string }) => void;
    __komutePaymentCallbacks?: {
      onSuccess?: (txnRef: string) => void;
      onFailure?: (error: string) => void;
    };
  }
}

// Paystack callback
function paystackCallback(response: { reference: string; status: string; message: string }) {
  console.log("[Wallet] Paystack callback:", response);
  
  if (response.status === "success") {
    toast.success("Payment successful! Verifying...");
    
    const amountStr = sessionStorage.getItem("pendingWalletPaystackAmount");
    const amount = amountStr ? parseInt(amountStr) : 0;
    
    fetch(`/api/wallet/verify/${response.reference}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          toast.success("Wallet funded successfully!", {
            description: `Your wallet has been credited with ${formatNaira(amount)}`,
          });
          sessionStorage.removeItem("pendingWalletPaystackAmount");
          window.dispatchEvent(new CustomEvent("walletFunded"));
        } else {
          toast.error("Payment verification failed", {
            description: "Please contact support with reference: " + response.reference,
          });
        }
      })
      .catch(error => {
        console.error("Verification error:", error);
        toast.error("Verification failed", {
          description: "Please contact support with reference: " + response.reference,
        });
      });
  } else {
    toast.error("Payment failed", {
      description: response.message || "Payment was not completed",
    });
  }
}

// Interswitch callback
function interswitchCallback(response: { resp: string; desc: string; txnref?: string }) {
  console.log("[Wallet] Interswitch callback:", response);
  
  if (response.resp === "00") {
    toast.success("Payment successful! Verifying...");
    
    const amountStr = sessionStorage.getItem("pendingWalletInterswitchAmount");
    const txnref = response.txnref || "";
    const amount = amountStr ? parseInt(amountStr) : 0;
    
    fetch(`/api/wallet/verify-isw/${txnref}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          toast.success("Wallet funded successfully!", {
            description: `Your wallet has been credited with ${formatNaira(amount)}`,
          });
          sessionStorage.removeItem("pendingWalletInterswitchAmount");
          window.dispatchEvent(new CustomEvent("walletFunded"));
        } else {
          toast.error("Payment verification failed", {
            description: "Please contact support with reference: " + txnref,
          });
        }
      })
      .catch(error => {
        console.error("Verification error:", error);
        toast.error("Verification failed", {
          description: "Please contact support with reference: " + txnref,
        });
      });
  } else {
    toast.error("Payment failed", {
      description: response.desc || "Payment was not completed",
    });
  }
}

interface FundWalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function FundWalletDialog({ open, onOpenChange, onSuccess }: FundWalletDialogProps) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<"paystack" | "interswitch">("paystack");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    window.komuteWalletCallback = interswitchCallback;
    window.__komutePaymentCallbacks = {
      onSuccess: (txnRef) => {
        // This is handled by the callback above
      },
      onFailure: (error) => {
        toast.error("Payment failed", { description: error });
      },
    };
    console.log("[Wallet] Callbacks registered");
  }, []);

  const presetAmounts = [
    { label: "₦500", value: "50000" },
    { label: "₦1,000", value: "100000" },
    { label: "₦2,000", value: "200000" },
    { label: "₦5,000", value: "500000" },
  ];

  async function handleFundWallet() {
    const amountToFund = customAmount ? parseInt(customAmount) * 100 : parseInt(amount);
    
    if (!amountToFund || amountToFund < 10000) {
      toast.error("Minimum deposit is ₦100");
      return;
    }

    setLoading(true);

    try {
      if (selectedProvider === "paystack") {
        await processPaystack(amountToFund);
      } else {
        await processInterswitch(amountToFund);
      }
    } catch (error) {
      console.error("Fund wallet error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to fund wallet");
    } finally {
      setLoading(false);
    }
  }

  async function processPaystack(amountToFund: number) {
    const res = await fetch("/api/wallet/fund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: amountToFund,
        provider: "paystack",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to initialize payment");
    }

    if (window.PaystackPop) {
      sessionStorage.setItem("pendingWalletPaystackAmount", String(amountToFund));
      
      const handler = window.PaystackPop.setup({
        key: data.paymentDetails.key,
        email: data.paymentDetails.email,
        amount: data.paymentDetails.amount,
        currency: "NGN",
        ref: data.reference,
        metadata: {
          wallet_fund: true,
        },
        callback: paystackCallback,
        onClose: () => {
          console.log("[Wallet] Paystack popup closed");
          toast.info("Payment cancelled");
          sessionStorage.removeItem("pendingWalletPaystackAmount");
        },
      });

      handler.openIframe();
    } else {
      throw new Error("Paystack not loaded. Please refresh and try again.");
    }
  }

  async function processInterswitch(amountToFund: number) {
    const merchantCode = process.env.NEXT_PUBLIC_ISW_MERCHANT_CODE;
    const payItemId = process.env.NEXT_PUBLIC_ISW_PAY_ITEM_ID;

    if (!merchantCode || !payItemId) {
      throw new Error("Interswitch not configured. Please contact support.");
    }

    const txnRef = `KWALLET_ISW_${Date.now()}`;

    if (window.webpayCheckout) {
      sessionStorage.setItem("pendingWalletInterswitchAmount", String(amountToFund));
      
      window.webpayCheckout({
        merchant_code: merchantCode,
        pay_item_id: payItemId,
        txn_ref: txnRef,
        amount: amountToFund,
        currency: 566,
        cust_email: "wallet@komute.app",
        cust_name: "Komute User",
        pay_item_name: "Wallet Funding",
        site_redirect_url: `${window.location.origin}/rider/savings`,
        mode: "TEST",
        onComplete: window.komuteWalletCallback,
      });
    } else {
      throw new Error("Interswitch not loaded. Please refresh and try again.");
    }
  }

  if (!mounted || !open) return null;

  const dialogContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Modal */}
      <div className="relative bg-background rounded-lg shadow-xl max-w-md w-full border max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-forest/10 flex items-center justify-center">
                <Plus className="h-5 w-5 text-forest" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold">Fund Wallet</h2>
                <p className="font-body text-xs text-muted-foreground">
                  Add funds to your wallet
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

          {/* Payment Provider Selection */}
          <div className="space-y-3 mb-6">
            <Label className="text-sm font-medium">Select Payment Provider</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedProvider("paystack")}
                className={`h-20 rounded-lg border-2 p-3 flex flex-col items-center justify-center gap-1 transition-colors ${
                  selectedProvider === "paystack"
                    ? "border-forest bg-forest/5"
                    : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <CreditCard className={`h-6 w-6 ${selectedProvider === "paystack" ? "text-forest" : "text-muted-foreground"}`} />
                <span className="font-body text-xs font-semibold">Paystack</span>
                <span className="font-body text-[10px] text-muted-foreground">Card, Transfer, USSD</span>
              </button>
              <button
                onClick={() => setSelectedProvider("interswitch")}
                className={`h-20 rounded-lg border-2 p-3 flex flex-col items-center justify-center gap-1 transition-colors ${
                  selectedProvider === "interswitch"
                    ? "border-forest bg-forest/5"
                    : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <WalletIcon className={`h-6 w-6 ${selectedProvider === "interswitch" ? "text-forest" : "text-muted-foreground"}`} />
                <span className="font-body text-xs font-semibold">Interswitch</span>
                <span className="font-body text-[10px] text-muted-foreground">Verve, Mastercard, Visa</span>
              </button>
            </div>
          </div>

          {/* Preset Amounts */}
          <div className="space-y-3 mb-6">
            <Label className="text-sm font-medium">Select Amount</Label>
            <div className="grid grid-cols-2 gap-3">
              {presetAmounts.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => {
                    setAmount(preset.value);
                    setCustomAmount("");
                  }}
                  className={`h-12 rounded-lg font-semibold text-sm transition-colors ${
                    amount === preset.value
                      ? "bg-forest text-white"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="space-y-2 mb-6">
            <Label htmlFor="custom-amount" className="text-sm font-medium">
              Or enter custom amount
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ₦
              </span>
              <Input
                id="custom-amount"
                type="number"
                placeholder="0.00"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  if (e.target.value) setAmount("");
                }}
                className="pl-7 h-12 text-lg font-semibold"
                min="100"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Minimum deposit: ₦100
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
              onClick={handleFundWallet}
              disabled={loading || (!amount && !customAmount)}
              className="flex-1 bg-forest hover:bg-forest/90"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Fund {amount || customAmount ? `₦${((parseInt(amount || customAmount) || 0)).toLocaleString()}` : ""}
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
