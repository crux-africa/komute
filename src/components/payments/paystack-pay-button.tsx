"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

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
  }
}

interface PaystackPayButtonProps {
  amount: number;
  rideId: string;
  seats?: number;
  customerEmail?: string;
  customerName?: string;
  onSuccess: (reference: string) => void;
  onFailure: (error: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

export function PaystackPayButton({
  amount,
  rideId,
  customerEmail,
  customerName,
  onSuccess,
  onFailure,
  disabled = false,
  loading = false,
}: PaystackPayButtonProps) {
  const [paystackReady, setPaystackReady] = useState(!!window.PaystackPop);

  useEffect(() => {
    if (paystackReady) return;
    
    const interval = setInterval(() => {
      if (window.PaystackPop) {
        setPaystackReady(true);
        clearInterval(interval);
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [paystackReady]);

  const handlePayment = useCallback(() => {
    if (!window.PaystackPop) {
      toast.error("Payment system not loaded. Please refresh and try again.");
      return;
    }

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

    if (!publicKey) {
      toast.error("Payment is not configured. Contact support.");
      onFailure("Payment not configured");
      return;
    }

    if (!amount || amount <= 0) {
      toast.error("Invalid payment amount.");
      onFailure("Invalid amount");
      return;
    }

    const reference = `KMT_PS_${rideId.slice(0, 8)}_${Date.now()}`;
    const email = customerEmail || `rider_${rideId.slice(0, 6)}@komute.app`;

    console.log("[Paystack] Initiating payment:", { publicKey, amount, reference, email });

    const handler = window.PaystackPop!.setup({
      key: publicKey,
      email: email,
      amount: amount, // Amount in kobo
      currency: "NGN",
      ref: reference,
      metadata: {
        custom_fields: [
          {
            display_name: "Customer Name",
            variable_name: "customer_name",
            value: customerName || "Komute Rider",
          },
          {
            display_name: "Ride ID",
            variable_name: "ride_id",
            value: rideId,
          },
        ],
      },
      callback: (response) => {
        console.log("[Paystack] Payment callback:", response);
        if (response.status === "success") {
          toast.success("Payment successful! Confirming booking...");
          onSuccess(response.reference);
        } else {
          const msg = response.message || "Payment was not completed.";
          toast.error("Payment Failed", { description: msg });
          onFailure(msg);
        }
      },
      onClose: () => {
        console.log("[Paystack] Payment popup closed");
        toast.info("Payment cancelled");
      },
    });

    handler.openIframe();
  }, [amount, rideId, customerEmail, customerName, onSuccess, onFailure]);

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || loading || !paystackReady}
      className="w-full h-12 bg-amber hover:bg-amber-dark text-ink font-semibold text-base"
      size="lg"
    >
      {!paystackReady ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Initializing...
        </>
      ) : (
        <>Pay ₦{(amount / 100).toLocaleString()}</>
      )}
    </Button>
  );
}
