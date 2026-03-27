import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { verifyTransaction } from "@/lib/interswitch";
import { bookRideSchema } from "@/lib/validations/ride";

// POST /api/bookings — book a seat (with Interswitch payment verification)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const validation = bookRideSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { rideId, seats, txnRef } = validation.data;

    // Get ride
    const ride = await prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) return NextResponse.json({ error: "Ride not found" }, { status: 404 });
    if (ride.status !== "SCHEDULED") return NextResponse.json({ error: "Ride is no longer available" }, { status: 400 });
    if (ride.availableSeats < seats) return NextResponse.json({ error: `Only ${ride.availableSeats} seat(s) left` }, { status: 400 });
    if (ride.driverId === user.id) return NextResponse.json({ error: "You cannot book your own ride" }, { status: 400 });

    // Check for existing booking
    const existing = await prisma.booking.findUnique({
      where: { rideId_riderId: { rideId, riderId: user.id } },
    });
    if (existing && existing.status !== "CANCELLED") {
      return NextResponse.json({ error: "You already have a booking for this ride" }, { status: 409 });
    }

    const totalPrice = ride.pricePerSeat * seats;

    // Verify payment with Interswitch
    const verification = await verifyTransaction(txnRef, totalPrice);
    if (!verification.success) {
      // Create failed payment record
      await prisma.payment.create({
        data: {
          bookingId: existing?.id || "pending",
          userId: user.id,
          amount: totalPrice,
          transactionRef: txnRef,
          responseCode: verification.data?.ResponseCode,
          responseDescription: verification.error,
          status: "FAILED",
        },
      });
      return NextResponse.json({ error: "Payment verification failed", detail: verification.error }, { status: 402 });
    }

    // Payment verified — create booking + payment + decrement seats in transaction
    const [booking] = await prisma.$transaction([
      prisma.booking.upsert({
        where: { rideId_riderId: { rideId, riderId: user.id } },
        create: {
          rideId,
          riderId: user.id,
          seats,
          totalPrice,
          status: "CONFIRMED",
          confirmedAt: new Date(),
        },
        update: {
          seats,
          totalPrice,
          status: "CONFIRMED",
          confirmedAt: new Date(),
          cancelledAt: null,
          cancelReason: null,
        },
      }),
      prisma.ride.update({
        where: { id: rideId },
        data: { availableSeats: { decrement: seats } },
      }),
    ]);

    // Create payment record
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        userId: user.id,
        amount: totalPrice,
        transactionRef: txnRef,
        paymentRef: verification.data?.PaymentReference,
        responseCode: verification.data?.ResponseCode,
        responseDescription: verification.data?.ResponseDescription,
        status: "VERIFIED",
        verifiedAt: new Date(),
      },
    });

    return NextResponse.json({
      booking: {
        id: booking.id,
        rideId: booking.rideId,
        seats: booking.seats,
        totalPrice: booking.totalPrice,
        status: booking.status,
      },
      message: "Booking confirmed!",
    }, { status: 201 });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json({ error: "Booking failed. Please try again." }, { status: 500 });
  }
}

// GET /api/bookings — get user's bookings
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const status = url.searchParams.get("status");

    const bookings = await prisma.booking.findMany({
      where: {
        riderId: user.id,
        ...(status && { status: status as "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "REFUNDED" }),
      },
      include: {
        ride: {
          include: {
            driver: {
              select: { id: true, name: true, avatar: true, rating: true, phone: true },
            },
          },
        },
        payment: { select: { status: true, transactionRef: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Get bookings error:", error);
    return NextResponse.json({ error: "Failed to load bookings" }, { status: 500 });
  }
}