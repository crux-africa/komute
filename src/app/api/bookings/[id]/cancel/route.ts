import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { calculateRefund, formatRefundMessage } from "@/lib/refund-policy";
import { initiatePaystackRefund } from "@/lib/paystack";

// POST /api/bookings/[id]/cancel — Cancel a booking and process refund
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  console.log("[Cancel] API route called");
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.log("[Cancel] User not authenticated");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Cancel] User:", user.id);

    // Handle both sync and async params
    const params = await Promise.resolve(context.params);
    const bookingId = params.id;

    console.log("[Cancel] Booking ID:", bookingId);

    // Get booking with ride and payment details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        ride: true,
        payment: true,
      },
    });

    if (!booking) {
      console.error("[Cancel] Booking not found:", bookingId);
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Verify user owns this booking
    if (booking.riderId !== user.id) {
      return NextResponse.json(
        { error: "You can only cancel your own bookings" },
        { status: 403 }
      );
    }

    // Check if already cancelled
    if (booking.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Booking is already cancelled" },
        { status: 400 }
      );
    }

    // Check if already completed
    if (booking.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Cannot cancel a completed ride" },
        { status: 400 }
      );
    }

    // Calculate refund
    const refundCalc = calculateRefund(
      booking.ride.departureTime,
      booking.totalPrice
    );

    // Prepare cancellation reason
    const cancellationReason = refundCalc.isEligible
      ? formatRefundMessage(refundCalc)
      : refundCalc.reason;

    // Start transaction: Update booking, restore seats, create refund record
    const result = await prisma.$transaction(async (tx) => {
      // Update booking status
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          cancelReason: cancellationReason,
        },
      });

      // Restore available seats to the ride
      await tx.ride.update({
        where: { id: booking.rideId },
        data: {
          availableSeats: {
            increment: booking.seats,
          },
        },
      });

      // Update payment status
      if (booking.payment) {
        await tx.payment.update({
          where: { id: booking.payment.id },
          data: {
            status: refundCalc.isEligible ? "REFUNDED" : "VERIFIED",
          },
        });
      }

      return updatedBooking;
    });

    // Process refund if eligible (async, don't block response)
    if (refundCalc.isEligible && refundCalc.refundAmount > 0 && booking.payment) {
      // For now, we only support Paystack refunds
      // Interswitch refunds would need to be handled separately
      const transactionRef = booking.payment.transactionRef;
      
      // Check if this was a Paystack payment (references start with KMT_PS_)
      if (transactionRef.includes("_PS_")) {
        console.log(`[Refund] Initiating Paystack refund for ${transactionRef}`);
        
        // Initiate refund asynchronously
        initiatePaystackRefund(
          transactionRef,
          refundCalc.refundAmount,
          `Booking cancellation: ${refundCalc.reason}`,
          `Booking ID: ${bookingId}, User: ${user.id}`
        )
          .then((refundResult) => {
            if (refundResult.success) {
              console.log(`[Refund] Success for ${transactionRef}:`, refundResult.data);
            } else {
              console.error(`[Refund] Failed for ${transactionRef}:`, refundResult.error);
            }
          })
          .catch((error) => {
            console.error(`[Refund] Error for ${transactionRef}:`, error);
          });
      } else {
        console.log(`[Refund] Interswitch refund not yet implemented for ${transactionRef}`);
        // TODO: Implement Interswitch refund if needed
      }
    }

    return NextResponse.json({
      success: true,
      message: "Booking cancelled successfully",
      booking: {
        id: result.id,
        status: result.status,
        cancelledAt: result.cancelledAt,
      },
      refund: {
        eligible: refundCalc.isEligible,
        amount: refundCalc.refundAmount,
        percentage: refundCalc.refundPercentage,
        message: cancellationReason,
      },
    });
  } catch (error) {
    console.error("[Cancel] Error cancelling booking:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { 
        error: "Failed to cancel booking. Please try again.",
        detail: errorMessage 
      },
      { status: 500 }
    );
  }
}
