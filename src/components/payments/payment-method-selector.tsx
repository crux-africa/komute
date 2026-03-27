"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InterswitchPayButton } from "./interswitch-pay-button";
import { PaystackPayButton } from "./paystack-pay-button";

interface PaymentMethodSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  rideId: string;
  seats?: number;
  customerEmail?: string;
  customerName?: string;
  onSuccess: (txnRef: string, provider: "interswitch" | "paystack") => void;
  onFailure: (error: string) => void;
}

export function PaymentMethodSelector({
  open,
  onOpenChange,
  amount,
  rideId,
  seats,
  customerEmail,
  customerName,
  onSuccess,
  onFailure,
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<"interswitch" | "paystack" | null>(null);

  const handleSuccess = (txnRef: string) => {
    onSuccess(txnRef, selectedMethod || "paystack");
  };

  const handleBack = () => {
    setSelectedMethod(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Choose Payment Method</DialogTitle>
          <DialogDescription className="font-body">
            Select your preferred payment provider to complete your booking
          </DialogDescription>
        </DialogHeader>

        {!selectedMethod ? (
          <div className="space-y-3 py-4">
            <Button
              onClick={() => setSelectedMethod("paystack")}
              variant="outline"
              className="w-full h-16 flex items-center justify-between px-4 hover:bg-forest/5 hover:border-forest"
            >
              <div className="flex flex-col items-start">
                <span className="font-heading font-semibold text-base">Paystack</span>
                <span className="font-body text-xs text-muted-foreground">
                  Card, Bank Transfer, USSD
                </span>
              </div>
              <div className="text-2xl">💳</div>
            </Button>

            <Button
              onClick={() => setSelectedMethod("interswitch")}
              variant="outline"
              className="w-full h-16 flex items-center justify-between px-4 hover:bg-forest/5 hover:border-forest"
            >
              <div className="flex flex-col items-start">
                <span className="font-heading font-semibold text-base">Interswitch</span>
                <span className="font-body text-xs text-muted-foreground">
                  Verve, Mastercard, Visa
                </span>
              </div>
              <div className="text-2xl">💰</div>
            </Button>

            <p className="font-body text-xs text-center text-muted-foreground pt-2">
              All transactions are secure and encrypted
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted/50 p-4 space-y-2">
              <div className="flex items-center justify-between font-body text-sm">
                <span className="text-muted-foreground">Payment Provider</span>
                <span className="font-semibold capitalize">{selectedMethod}</span>
              </div>
              <div className="flex items-center justify-between font-body text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold text-forest dark:text-forest-light">
                  ₦{(amount / 100).toLocaleString()}
                </span>
              </div>
            </div>

            {selectedMethod === "paystack" && (
              <PaystackPayButton
                amount={amount}
                rideId={rideId}
                seats={seats}
                customerEmail={customerEmail}
                customerName={customerName}
                onSuccess={handleSuccess}
                onFailure={onFailure}
              />
            )}

            {selectedMethod === "interswitch" && (
              <InterswitchPayButton
                amount={amount}
                rideId={rideId}
                seats={seats}
                customerEmail={customerEmail}
                customerName={customerName}
                onSuccess={handleSuccess}
                onFailure={onFailure}
              />
            )}

            <Button
              variant="ghost"
              onClick={handleBack}
              className="w-full font-body text-sm"
            >
              Choose different method
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
