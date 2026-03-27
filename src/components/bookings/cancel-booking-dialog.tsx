"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";

interface CancelBookingDialogProps {
  bookingId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  refundInfo?: {
    percentage: number;
    amount: number;
    message: string;
  };
}

export function CancelBookingDialog({
  bookingId,
  open,
  onOpenChange,
  onSuccess,
  refundInfo,
}: CancelBookingDialogProps) {
  const [cancelling, setCancelling] = useState(false);

  async function handleCancel() {
    setCancelling(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "POST",
      });

      const result = await res.json();

      if (!res.ok) {
        console.error("Cancellation failed:", res.status, result);
        throw new Error(result.error || result.detail || "Failed to cancel booking");
      }

      toast.success("Booking cancelled successfully", {
        description: result.refund.eligible
          ? `You will receive ₦${(result.refund.amount / 100).toLocaleString()} (${result.refund.percentage}% refund) within 5-7 business days.`
          : "No refund available for this cancellation.",
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Cancellation error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to cancel booking"
      );
    } finally {
      setCancelling(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber" />
            Cancel Booking?
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-3 pt-2">
              <div className="font-body text-sm text-foreground">
                Are you sure you want to cancel this booking? This action cannot
                be undone.
              </div>

              {refundInfo && (
                <div className="rounded-lg bg-muted/50 border border-border p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-heading text-xs font-semibold text-foreground mb-1">
                        Refund Information
                      </div>
                      <div className="font-body text-xs text-muted-foreground">
                        {refundInfo.message}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="font-body text-xs text-muted-foreground">
                The seat(s) will be made available for other riders, and you can
                book another ride at any time.
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={cancelling}
            className="w-full sm:w-auto"
          >
            Keep Booking
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={cancelling}
            className="w-full sm:w-auto"
          >
            {cancelling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              "Yes, Cancel Booking"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
