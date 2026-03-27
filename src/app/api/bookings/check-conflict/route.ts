import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { checkBookingConflicts } from "@/lib/booking-conflicts";
import prisma from "@/lib/prisma";

// POST /api/bookings/check-conflict — Check for booking time conflicts before payment
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { rideId } = body;

    if (!rideId) {
      return NextResponse.json({ error: "Ride ID required" }, { status: 400 });
    }

    // Get ride
    const ride = await prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) {
      return NextResponse.json({ error: "Ride not found" }, { status: 404 });
    }

    // Check for conflicts
    const conflictCheck = await checkBookingConflicts(
      user.id,
      rideId,
      ride.departureTime
    );

    if (conflictCheck.hasConflict) {
      return NextResponse.json({
        hasConflict: true,
        message: conflictCheck.message,
        conflictingBooking: conflictCheck.conflictingBooking,
      });
    }

    return NextResponse.json({
      hasConflict: false,
      message: "No conflicts found",
    });
  } catch (error) {
    console.error("Error checking conflicts:", error);
    return NextResponse.json(
      { error: "Failed to check conflicts" },
      { status: 500 }
    );
  }
}
