import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createRideSchema, searchRidesSchema } from "@/lib/validations/ride";
import { haversineDistance } from "@/lib/utils";

// GET /api/rides — search for rides
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const params = {
      fromLat: url.searchParams.get("fromLat"),
      fromLng: url.searchParams.get("fromLng"),
      toLat: url.searchParams.get("toLat"),
      toLng: url.searchParams.get("toLng"),
      date: url.searchParams.get("date"),
      maxDistance: url.searchParams.get("maxDistance"),
    };

    const validation = searchRidesSchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { fromLat, fromLng, toLat, toLng, date, maxDistance } = validation.data;

    // Get rides that are scheduled and in the future
    const dateFilter = date ? new Date(date) : new Date();
    const dateEnd = new Date(dateFilter);
    dateEnd.setHours(23, 59, 59, 999);

    const rides = await prisma.ride.findMany({
      where: {
        status: "SCHEDULED",
        availableSeats: { gt: 0 },
        departureTime: { gte: new Date(), lte: dateEnd },
      },
      include: {
        driver: {
          select: {
            id: true, name: true, firstName: true, lastName: true,
            avatar: true, rating: true, ratingCount: true, ninVerified: true,
            driverProfile: {
              select: {
                vehicleType: true, vehicleMake: true, vehicleModel: true,
                vehicleColor: true, plateNumber: true, licenseVerified: true,
                faceVerified: true,
              },
            },
          },
        },
        _count: { select: { bookings: true } },
      },
      orderBy: { departureTime: "asc" },
      take: 50,
    });

    // Filter by proximity using Haversine
    const matched = rides
      .map((ride) => {
        const originDist = haversineDistance(fromLat, fromLng, ride.originLat, ride.originLng);
        const destDist = haversineDistance(toLat, toLng, ride.destLat, ride.destLng);
        return { ...ride, originDistance: Math.round(originDist * 10) / 10, destDistance: Math.round(destDist * 10) / 10 };
      })
      .filter((ride) => ride.originDistance <= maxDistance && ride.destDistance <= maxDistance + 1)
      .sort((a, b) => {
        // Score: 40% pickup distance, 30% price, 20% time, 10% rating
        const scoreA = a.originDistance * 0.4 + (a.pricePerSeat / 100000) * 0.3;
        const scoreB = b.originDistance * 0.4 + (b.pricePerSeat / 100000) * 0.3;
        return scoreA - scoreB;
      });

    return NextResponse.json({ rides: matched, total: matched.length });
  } catch (error) {
    console.error("Search rides error:", error);
    return NextResponse.json({ error: "Failed to search rides" }, { status: 500 });
  }
}

// POST /api/rides — create a new ride (driver only)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!user.roles.includes("DRIVER")) return NextResponse.json({ error: "Only drivers can create rides" }, { status: 403 });
    if (!user.driverProfile) return NextResponse.json({ error: "Complete driver profile first" }, { status: 400 });

    const body = await req.json();
    const validation = createRideSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const data = validation.data;

    const ride = await prisma.ride.create({
      data: {
        driverId: user.id,
        originLat: data.originLat,
        originLng: data.originLng,
        originAddress: data.originAddress,
        originArea: data.originArea,
        destLat: data.destLat,
        destLng: data.destLng,
        destAddress: data.destAddress,
        destArea: data.destArea,
        departureTime: new Date(data.departureTime),
        availableSeats: data.totalSeats,
        totalSeats: data.totalSeats,
        pricePerSeat: data.pricePerSeat,
        vehicleType: data.vehicleType,
        isRecurring: data.isRecurring,
        recurringDays: data.recurringDays,
        notes: data.notes,
      },
    });

    return NextResponse.json(ride, { status: 201 });
  } catch (error) {
    console.error("Create ride error:", error);
    return NextResponse.json({ error: "Failed to create ride" }, { status: 500 });
  }
}