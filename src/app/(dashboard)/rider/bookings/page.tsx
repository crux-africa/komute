"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CancelBookingDialog } from "@/components/bookings/cancel-booking-dialog";
import { TicketCheck, Clock, X } from "lucide-react";
import { formatNaira, formatTime, formatDate, VEHICLE_TYPES } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED"
  | "REFUNDED";

type BookingItem = {
  id: string;
  seats: number;
  totalPrice: number;
  status: BookingStatus;
  ride: {
    id: string;
    originAddress: string;
    originArea?: string | null;
    destAddress: string;
    destArea?: string | null;
    departureTime: string; // JSON from API
    vehicleType: "CAR" | "SHUTTLE" | "KEKE";
    driver?: { name?: string | null } | null;
  };
};

type BookingsResponse = {
  bookings?: BookingItem[];
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);
  const searchParams = useSearchParams();

  // Handle payment callback results
  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    const bookingId = searchParams.get("bookingId");

    if (success === "true" && bookingId) {
      toast.success("Booking confirmed! Your seat has been reserved.", {
        description: "Show up at the pickup point on time.",
      });
    } else if (error) {
      const errorMessages: Record<string, string> = {
        payment_failed: "Payment was not completed. Please try again.",
        verification_failed: "We couldn't verify your payment. Please contact support.",
        already_booked: "You already have a booking for this ride.",
        ride_not_found: "The ride is no longer available.",
        missing_params: "Invalid payment response. Please try again.",
        server_error: "Something went wrong. Please contact support with your transaction reference.",
      };
      const txnRef = searchParams.get("txnRef");
      toast.error(errorMessages[error] || "Payment failed. Please try again.", {
        description: txnRef ? `Ref: ${txnRef}` : undefined,
      });
    }
  }, [searchParams]);

  // Fetch bookings
  useEffect(() => {
    async function fetchBookings() {
      setLoading(true);
      try {
        const res = await fetch("/api/bookings");
        if (!res.ok) throw new Error("Failed to fetch bookings");
        const data: BookingsResponse = await res.json();
        setBookings(data.bookings || []);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast.error("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  function handleCancelClick(booking: BookingItem, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  }

  function handleCancelSuccess() {
    // Refresh bookings list
    setLoading(true);
    fetch("/api/bookings")
      .then(res => res.json())
      .then(data => setBookings(data.bookings || []))
      .finally(() => setLoading(false));
  }

  const statusColors: Record<string, string> = {
    CONFIRMED: "bg-forest/10 text-forest dark:bg-forest-light/10 dark:text-forest-light",
    COMPLETED: "bg-muted text-muted-foreground",
    CANCELLED: "bg-destructive/10 text-destructive",
    PENDING: "bg-amber/10 text-amber-dark dark:text-amber",
  };

  if (loading) return <div className="space-y-3">{[1, 2, 3].map(i => <Card key={i}><CardContent className="p-4"><Skeleton className="h-24" /></CardContent></Card>)}</div>;

  if (bookings.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center py-16 text-center">
          <TicketCheck className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="font-heading text-sm font-semibold">No bookings yet</p>
          <p className="font-body text-xs text-muted-foreground mt-1">Search for rides and book your first seat</p>
          <Link href="/rider" className="mt-4"><Badge variant="outline">Find rides</Badge></Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((b: BookingItem) => {
        const ride = b.ride;
        const departure = new Date(ride.departureTime);
        const vehicle = VEHICLE_TYPES[ride.vehicleType as keyof typeof VEHICLE_TYPES];
        const canCancel = b.status === "CONFIRMED" || b.status === "PENDING";
        
        return (
          <Card key={b.id} className="transition-all hover:shadow-sm">
            <CardContent className="p-4">
              <Link href={`/rides/${ride.id}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-heading text-sm font-bold">{ride.originArea || ride.originAddress} → {ride.destArea || ride.destAddress}</p>
                    <div className="flex items-center gap-3 mt-1 font-body text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatTime(departure)}</span>
                      <span>{formatDate(departure)}</span>
                      <span>{vehicle?.emoji} {vehicle?.label}</span>
                    </div>
                  </div>
                  <Badge className={statusColors[b.status] || ""}>{b.status.toLowerCase()}</Badge>
                </div>
              </Link>
              
              <div className="flex items-center justify-between border-t border-border/50 pt-3">
                <div>
                  <p className="font-body text-xs text-muted-foreground">{b.seats} seat(s) • Driver: {ride.driver?.name || "Unknown"}</p>
                  <p className="font-heading text-sm font-bold text-forest dark:text-forest-light mt-1">{formatNaira(b.totalPrice)}</p>
                </div>
                {canCancel && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleCancelClick(b, e)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {selectedBooking && (
        <CancelBookingDialog
          bookingId={selectedBooking.id}
          open={cancelDialogOpen}
          onOpenChange={setCancelDialogOpen}
          onSuccess={handleCancelSuccess}
        />
      )}
    </div>
  );
}