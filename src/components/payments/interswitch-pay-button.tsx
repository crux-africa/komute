"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

declare global {
  interface Window {
    webpayCheckout?: (config: Record<string, unknown>) => void;
    komutePaymentCallback?: (response: { resp: string; desc: string; txnref?: string }) => void;
    __komutePaymentCallbacks?: {
      onSuccess?: (txnRef: string) => void;
      onFailure?: (error: string) => void;
    };
  }
}

if (typeof window !== "undefined") {
  window.komutePaymentCallback = function(response: { resp: string; desc: string; txnref?: string }) {
    console.log("[Payment] Callback:", response);
    const cb = window.__komutePaymentCallbacks;
    if (response.resp === "00") {
      toast.success("Payment successful! Confirming booking...");
      cb?.onSuccess?.(response.txnref || "");
    } else {
      const msg = response.desc || "Payment was not completed.";
      toast.error("Payment Failed", { description: msg });
      cb?.onFailure?.(msg);
    }
  };
}

interface PayButtonProps {
  amount: number;
  rideId: string;
  seats?: number;
  customerEmail?: string;
  customerName?: string;
  onSuccess: (txnRef: string) => void;
  onFailure: (error: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

export function InterswitchPayButton({ amount, rideId, customerEmail, customerName, onSuccess, onFailure, disabled = false, loading = false }: PayButtonProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    window.__komutePaymentCallbacks = { onSuccess, onFailure };
    
    if (window.webpayCheckout) {
      requestAnimationFrame(() => setIsReady(true));
    } else {
      const interval = setInterval(() => {
        if (window.webpayCheckout) {
          clearInterval(interval);
          requestAnimationFrame(() => setIsReady(true));
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [onSuccess, onFailure]);

  const handlePayment = useCallback(() => {
    if (!window.webpayCheckout) {
      toast.error("Payment system not loaded. Please refresh and try again.");
      return;
    }

    const merchantCode = process.env.NEXT_PUBLIC_ISW_MERCHANT_CODE;
    const payItemId = process.env.NEXT_PUBLIC_ISW_PAY_ITEM_ID;

    if (!merchantCode || !payItemId) {
      toast.error("Payment is not configured. Contact support.");
      onFailure("Payment not configured");
      return;
    }

    if (!amount || amount <= 0) {
      toast.error("Invalid payment amount.");
      onFailure("Invalid amount");
      return;
    }

    const txnRef = `KMT_${rideId.slice(0, 8)}_${Date.now()}`;
    const email = customerEmail || `rider_${rideId.slice(0, 6)}@komute.app`;
    const name = customerName || "Komute Rider";

    console.log("[Payment] Initiating inline checkout:", { merchantCode, payItemId, amount, txnRef });

    window.webpayCheckout({
      merchant_code: merchantCode,
      pay_item_id: payItemId,
      txn_ref: txnRef,
      amount: amount,
      currency: 566,
      cust_email: email,
      cust_name: name,
      pay_item_name: "Komute Ride Booking",
      site_redirect_url: `${window.location.origin}/rider/bookings`,
      mode: "TEST",
      onComplete: window.komutePaymentCallback,
    });
  }, [amount, rideId, customerEmail, customerName, onFailure]);

  return (
    <Button 
      onClick={handlePayment} 
      disabled={disabled || loading || !isReady} 
      className="w-full h-12 bg-amber hover:bg-amber-dark text-ink font-semibold text-base" 
      size="lg"
    >
      {!isReady ? (
        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Initializing...</>
      ) : (
        <>Pay ₦{(amount / 100).toLocaleString()}</>
      )}
    </Button>
  );
}
