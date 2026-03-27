import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const ratingSchema = z.object({
  rideId: z.string().min(1),
  toUserId: z.string().min(1),
  score: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

// POST /api/ratings — submit a rating
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const validation = ratingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { rideId, toUserId, score, comment } = validation.data;

    // Verify the ride exists and user was part of it
    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
      include: { bookings: { select: { riderId: true } } },
    });

    if (!ride) return NextResponse.json({ error: "Ride not found" }, { status: 404 });
    if (ride.status !== "COMPLETED" && ride.status !== "IN_PROGRESS") {
      return NextResponse.json({ error: "Can only rate completed rides" }, { status: 400 });
    }

    // Check user was driver or rider on this ride
    const isDriver = ride.driverId === user.id;
    const isRider = ride.bookings.some((b) => b.riderId === user.id);
    if (!isDriver && !isRider) {
      return NextResponse.json({ error: "You were not part of this ride" }, { status: 403 });
    }

    // Can't rate yourself
    if (toUserId === user.id) {
      return NextResponse.json({ error: "Cannot rate yourself" }, { status: 400 });
    }

    // Check if already rated
    const existing = await prisma.rating.findUnique({
      where: { rideId_fromUserId: { rideId, fromUserId: user.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "You already rated this ride" }, { status: 409 });
    }

    // Create rating
    const rating = await prisma.rating.create({
      data: {
        rideId,
        fromUserId: user.id,
        toUserId,
        score,
        comment,
      },
    });

    // Update the rated user's average rating
    const allRatings = await prisma.rating.findMany({
      where: { toUserId },
      select: { score: true },
    });

    const avgRating = allRatings.reduce((sum, r) => sum + r.score, 0) / allRatings.length;

    await prisma.user.update({
      where: { id: toUserId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        ratingCount: allRatings.length,
      },
    });

    return NextResponse.json({ rating, message: "Rating submitted" }, { status: 201 });
  } catch (error) {
    console.error("Rating error:", error);
    return NextResponse.json({ error: "Failed to submit rating" }, { status: 500 });
  }
}