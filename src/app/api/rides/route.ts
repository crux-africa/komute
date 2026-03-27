import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createRideSchema } from "@/lib/validations/ride";
import { haversineDistance } from "@/lib/utils";
import { Prisma } from "@/generated/prisma/client";

// GET /api/rides — search for rides (supports coords OR text)
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const fromLat = url.searchParams.get("fromLat");
    const fromLng = url.searchParams.get("fromLng");
    const toLat = url.searchParams.get("toLat");
    const toLng = url.searchParams.get("toLng");
    const fromText = url.searchParams.get("from");
    const toText = url.searchParams.get("to");
    const date = url.searchParams.get("date");
    const maxDistance = Number(url.searchParams.get("maxDistance") || "10");

    // Get rides that are scheduled and in the future
    const now = new Date();
    const dateEnd = date ? new Date(date) : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    dateEnd.setHours(23, 59, 59, 999);

    // Build where clause — support text-based area search
    const where: Prisma.RideWhereInput = {
      status: "SCHEDULED",
      availableSeats: { gt: 0 },
      departureTime: { gte: now, lte: dateEnd },
    };

    if (fromText) {
      where.originArea = { contains: fromText, mode: "insensitive" };
    }
    if (toText) {
      where.destArea = { contains: toText, mode: "insensitive" };
    }

    const rides = await prisma.ride.findMany({
      where,
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

    // If coordinate search, filter by Haversine proximity
    if (fromLat && fromLng && toLat && toLng) {
      const fLat = Number(fromLat);
      const fLng = Number(fromLng);
      const tLat = Number(toLat);
      const tLng = Number(toLng);

      const matched = rides
        .map((ride) => {
          const originDist = haversineDistance(fLat, fLng, ride.originLat, ride.originLng);
          const destDist = haversineDistance(tLat, tLng, ride.destLat, ride.destLng);
          return { ...ride, originDistance: Math.round(originDist * 10) / 10, destDistance: Math.round(destDist * 10) / 10 };
        })
        .filter((ride) => ride.originDistance <= maxDistance && ride.destDistance <= maxDistance)
        .sort((a, b) => a.originDistance - b.originDistance);

      return NextResponse.json({ rides: matched, total: matched.length });
    }

    // Text search — return rides as-is (already filtered by area)
    return NextResponse.json({ rides, total: rides.length });
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