"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaymentMethodSelector } from "@/components/payments/payment-method-selector";
import { CheckCircle2, Loader2 } from "lucide-react";
import { formatNaira } from "@/lib/utils";

interface Props {
  rideId: string;
  pricePerSeat: number;
  availableSeats: number;
  alreadyBooked: boolean;
  userEmail?: string | null;
  userName?: string | null;
}

export function RideBookingClient({ rideId, pricePerSeat, availableSeats, alreadyBooked, userEmail, userName }: Props) {
  const router = useRouter();
  const [seats, setSeats] = useState(1);
  const [step, setStep] = useState<"select" | "pay" | "confirming" | "done" | "error">(alreadyBooked ? "done" : "select");
  const [error, setError] = useState("");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const totalPrice = pricePerSeat * seats;

  async function handlePaymentSuccess(txnRef: string, provider: "interswitch" | "paystack") {
    setShowPaymentDialog(false);
    setStep("confirming");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rideId, seats, txnRef, provider }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || result.detail);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed after payment. Contact support.");
      setStep("error");
    }
  }

  function handlePaymentFailure(err: string) {
    setError(err);
    setShowPaymentDialog(false);
    setStep("error");
  }

  if (step === "done" || alreadyBooked) {
    return (
      <Card className="border-forest/30 dark:border-forest-light/30">
        <CardContent className="flex flex-col items-center py-8 text-center">
          <CheckCircle2 className="h-10 w-10 text-forest dark:text-forest-light mb-3" />
          <p className="font-heading text-lg font-bold">Seat booked!</p>
          <p className="font-body text-sm text-muted-foreground mt-1">Show up at the pickup point on time. Have a smooth ride.</p>
          <Button onClick={() => router.push("/rider/bookings")} variant="outline" className="mt-4 font-body">View my bookings</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber/30 bg-amber/[0.02]">
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <p className="font-heading text-base font-bold">Book this ride</p>
          <div className="text-right">
            <p className="font-heading text-xl font-bold text-forest dark:text-forest-light">{formatNaira(totalPrice)}</p>
            <p className="font-body text-[10px] text-muted-foreground">{seats} seat(s) × {formatNaira(pricePerSeat)}</p>
          </div>
        </div>

        {step === "select" && (
          <>
            <div className="space-y-2">
              <label className="font-body text-sm font-medium">Number of seats</label>
              <Select defaultValue="1" onValueChange={(v) => setSeats(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: Math.min(availableSeats, 4) }, (_, i) => i + 1).map((n) => (
                    <SelectItem key={n} value={String(n)}>{n} seat{n > 1 ? "s" : ""} — {formatNaira(pricePerSeat * n)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cost comparison */}
            <div className="rounded-lg bg-forest/5 dark:bg-forest-light/5 px-4 py-3 flex items-center justify-between">
              <div className="font-body text-xs">
                <p className="text-muted-foreground">Same trip on Bolt</p>
                <p className="font-medium text-foreground">~{formatNaira(pricePerSeat * 3)}</p>
              </div>
              <div className="font-body text-xs text-right">
                <p className="text-muted-foreground">You save</p>
                <p className="font-bold text-forest dark:text-forest-light">{formatNaira(pricePerSeat * 3 - totalPrice)}</p>
              </div>
            </div>

            <Button onClick={() => setStep("pay")} className="w-full h-12 bg-amber hover:bg-amber-dark text-ink font-semibold text-base">
              Continue to payment — {formatNaira(totalPrice)}
            </Button>
          </>
        )}

        {step === "pay" && (
          <>
            <p className="font-body text-sm text-muted-foreground">Complete payment to lock your seat(s).</p>
            <Button 
              onClick={() => setShowPaymentDialog(true)} 
              className="w-full h-12 bg-amber hover:bg-amber-dark text-ink font-semibold text-base"
              size="lg"
            >
              Choose Payment Method
            </Button>
            <Button variant="ghost" onClick={() => setStep("select")} className="w-full font-body text-sm">Go back</Button>
            
            <PaymentMethodSelector
              open={showPaymentDialog}
              onOpenChange={setShowPaymentDialog}
              amount={totalPrice}
              rideId={rideId}
              seats={seats}
              customerEmail={userEmail || undefined}
              customerName={userName || undefined}
              onSuccess={handlePaymentSuccess}
              onFailure={handlePaymentFailure}
            />
          </>
        )}

        {step === "confirming" && (
          <div className="flex flex-col items-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-forest dark:text-forest-light mb-3" />
            <p className="font-body text-sm text-muted-foreground">Verifying payment and confirming your booking...</p>
          </div>
        )}

        {step === "error" && (
          <div className="space-y-3">
            <div className="rounded-md bg-destructive/10 px-3 py-2 font-body text-sm text-destructive">{error}</div>
            <Button onClick={() => { setStep("select"); setError(""); }} variant="outline" className="w-full font-body">Try again</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}