"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

declare global {
  interface Window {
    webpayCheckout: (config: Record<string, unknown>) => void;
  }
}

interface PayButtonProps {
  amount: number;
  rideId: string;
  customerEmail?: string;
  customerName?: string;
  onSuccess: (txnRef: string) => void;
  onFailure: (error: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

export function InterswitchPayButton({ amount, rideId, customerEmail, customerName, onSuccess, onFailure, disabled = false, loading = false }: PayButtonProps) {
  const handlePayment = useCallback(() => {
    if (!window.webpayCheckout) {
      onFailure("Payment system not loaded. Please refresh and try again.");
      return;
    }

    const txnRef = `KMT_${rideId.slice(0, 8)}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    window.webpayCheckout({
      merchant_code: process.env.NEXT_PUBLIC_ISW_MERCHANT_CODE,
      pay_item_id: process.env.NEXT_PUBLIC_ISW_PAY_ITEM_ID,
      txn_ref: txnRef,
      amount,
      currency: 566,
      cust_email: customerEmail || "",
      cust_name: customerName || "",
      site_redirect_url: window.location.origin + "/rider/bookings",
      mode: "TEST",
      onComplete: (response: { resp: string; desc: string }) => {
        if (response.resp === "00") {
          onSuccess(txnRef);
        } else {
          onFailure(response.desc || "Payment was not completed");
        }
      },
    });
  }, [amount, rideId, customerEmail, customerName, onSuccess, onFailure]);

  return (
    <Button onClick={handlePayment} disabled={disabled || loading} className="w-full h-12 bg-amber hover:bg-amber-dark text-ink font-semibold text-base" size="lg">
      {loading ? (
        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</>
      ) : (
        <>Pay ₦{(amount / 100).toLocaleString()}</>
      )}
    </Button>
  );
}