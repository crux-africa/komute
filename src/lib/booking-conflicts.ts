import prisma from "@/lib/prisma";

/**
 * Booking Conflict Detection
 * 
 * Rules:
 * 1. A user cannot book multiple rides that overlap in time
 * 2. Only CONFIRMED or PENDING bookings count as conflicts
 * 3. CANCELLED, COMPLETED, or REFUNDED bookings don't count
 * 4. Buffer time: 30 minutes before and after each ride
 * 
 * Example:
 * - User books ride departing at 2:00 PM
 * - Buffer: 1:30 PM - 2:30 PM (ride blocked)
 * - Cannot book another ride between 1:30 PM - 2:30 PM until first ride is completed/cancelled
 */

const BUFFER_TIME_MINUTES = 30;

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictingBooking?: {
    id: string;
    rideId: string;
    departureTime: Date;
    originAddress: string;
    destAddress: string;
    status: string;
  };
  message?: string;
}

/**
 * Check if a user has any conflicting bookings for a given ride time
 * @param userId - The user ID to check
 * @param rideId - The ride ID they're trying to book
 * @param departureTime - The departure time of the ride
 * @returns ConflictCheckResult with conflict details
 */
export async function checkBookingConflicts(
  userId: string,
  rideId: string,
  departureTime: Date
): Promise<ConflictCheckResult> {
  try {
    // Calculate time range with buffer
    const bufferBefore = new Date(departureTime);
    bufferBefore.setMinutes(bufferBefore.getMinutes() - BUFFER_TIME_MINUTES);

    const bufferAfter = new Date(departureTime);
    bufferAfter.setMinutes(bufferAfter.getMinutes() + BUFFER_TIME_MINUTES);

    // Find all active bookings for this user in the time range
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        riderId: userId,
        rideId: { not: rideId }, // Exclude the current ride (for updates)
        status: {
          in: ["CONFIRMED", "PENDING"], // Only active bookings
        },
        ride: {
          departureTime: {
            gte: bufferBefore,
            lte: bufferAfter,
          },
        },
      },
      include: {
        ride: {
          select: {
            id: true,
            departureTime: true,
            originAddress: true,
            originArea: true,
            destAddress: true,
            destArea: true,
          },
        },
      },
      orderBy: {
        ride: {
          departureTime: "asc",
        },
      },
      take: 1, // We only need to know if there's at least one conflict
    });

    if (conflictingBookings.length > 0) {
      const conflict = conflictingBookings[0];
      const conflictTime = conflict.ride.departureTime;
      
      return {
        hasConflict: true,
        conflictingBooking: {
          id: conflict.id,
          rideId: conflict.ride.id,
          departureTime: conflictTime,
          originAddress: conflict.ride.originArea || conflict.ride.originAddress,
          destAddress: conflict.ride.destArea || conflict.ride.destAddress,
          status: conflict.status,
        },
        message: `You already have a ${conflict.status.toLowerCase()} booking departing at ${formatTime(conflictTime)} (${conflict.ride.originArea || conflict.ride.originAddress} → ${conflict.ride.destArea || conflict.ride.destAddress}). Please complete or cancel that booking first.`,
      };
    }

    return {
      hasConflict: false,
    };
  } catch (error) {
    console.error("Error checking booking conflicts:", error);
    // In case of error, allow the booking to proceed (fail-open)
    // This prevents database errors from blocking legitimate bookings
    return {
      hasConflict: false,
    };
  }
}

/**
 * Format time for display in conflict messages
 */
function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-NG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/**
 * Get all active bookings for a user in a date range
 * Useful for showing user their schedule
 */
export async function getUserActiveBookings(
  userId: string,
  startDate: Date,
  endDate: Date
) {
  return await prisma.booking.findMany({
    where: {
      riderId: userId,
      status: {
        in: ["CONFIRMED", "PENDING"],
      },
      ride: {
        departureTime: {
          gte: startDate,
          lte: endDate,
        },
      },
    },
    include: {
      ride: {
        select: {
          id: true,
          departureTime: true,
          originAddress: true,
          originArea: true,
          destAddress: true,
          destArea: true,
          vehicleType: true,
          driver: {
            select: {
              name: true,
              phone: true,
            },
          },
        },
      },
    },
    orderBy: {
      ride: {
        departureTime: "asc",
      },
    },
  });
}
