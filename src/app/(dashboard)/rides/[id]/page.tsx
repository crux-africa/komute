import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatNaira, formatTime, formatDate, VEHICLE_TYPES } from "@/lib/utils";
import { RideBookingClient } from "./booking-client";

export default async function RideDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const ride = await prisma.ride.findUnique({
    where: { id },
    include: {
      driver: {
        select: {
          id: true, name: true, firstName: true, lastName: true,
          phone: true, avatar: true, rating: true, ratingCount: true,
          ninVerified: true,
          driverProfile: {
            select: {
              vehicleType: true, vehicleMake: true, vehicleModel: true,
              vehicleColor: true, plateNumber: true, licenseVerified: true,
              faceVerified: true,
            },
          },
        },
      },
      bookings: { where: { status: { in: ["CONFIRMED", "COMPLETED"] } }, select: { riderId: true } },
      ratings: { select: { score: true, comment: true, fromUser: { select: { name: true } }, createdAt: true }, orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!ride) notFound();

  const vehicle = VEHICLE_TYPES[ride.vehicleType];
  const departure = new Date(ride.departureTime);
  const isOwner = ride.driverId === user.id;
  const alreadyBooked = ride.bookings.some((b) => b.riderId === user.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Ride info card */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
        {/* Route */}
        <div className="flex items-start gap-4">
          <div className="mt-1.5 flex flex-col items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-forest dark:bg-forest-light" />
            <div className="h-12 w-px bg-border" />
            <div className="h-3 w-3 rounded-full bg-amber" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <p className="font-heading text-lg font-bold">{ride.originArea || ride.originAddress}</p>
              <p className="font-body text-xs text-muted-foreground">{ride.originAddress}</p>
            </div>
            <div>
              <p className="font-heading text-lg font-bold">{ride.destArea || ride.destAddress}</p>
              <p className="font-body text-xs text-muted-foreground">{ride.destAddress}</p>
            </div>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-3 gap-4 rounded-xl bg-secondary/50 p-4">
          <div className="text-center">
            <p className="font-body text-xs text-muted-foreground">Departure</p>
            <p className="font-heading text-sm font-bold mt-0.5">{formatTime(departure)}</p>
            <p className="font-body text-[10px] text-muted-foreground">{formatDate(departure)}</p>
          </div>
          <div className="text-center border-x border-border">
            <p className="font-body text-xs text-muted-foreground">Price</p>
            <p className="font-heading text-sm font-bold text-forest dark:text-forest-light mt-0.5">{formatNaira(ride.pricePerSeat)}</p>
            <p className="font-body text-[10px] text-muted-foreground">per seat</p>
          </div>
          <div className="text-center">
            <p className="font-body text-xs text-muted-foreground">Seats left</p>
            <p className="font-heading text-sm font-bold mt-0.5">{ride.availableSeats}/{ride.totalSeats}</p>
            <p className="font-body text-[10px] text-muted-foreground">{vehicle.emoji} {vehicle.label}</p>
          </div>
        </div>

        {ride.notes && (
          <div className="rounded-lg bg-amber/5 border border-amber/20 px-4 py-3">
            <p className="font-body text-sm text-foreground">{ride.notes}</p>
          </div>
        )}
      </div>

      {/* Driver card */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="font-body text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Your driver</p>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-forest/10 font-heading text-lg font-bold text-forest dark:bg-forest-light/10 dark:text-forest-light">
            {(ride.driver.name || "D").charAt(0)}
          </div>
          <div className="flex-1">
            <p className="font-heading text-base font-bold">{ride.driver.name || "Driver"}</p>
            <div className="flex items-center gap-3 mt-1 font-body text-xs text-muted-foreground">
              <span className="text-amber-dark dark:text-amber">★ {ride.driver.rating > 0 ? ride.driver.rating.toFixed(1) : "New"}</span>
              {ride.driver.ratingCount > 0 && <span>{ride.driver.ratingCount} rides</span>}
            </div>
            <div className="flex gap-2 mt-2">
              {ride.driver.ninVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-forest/10 px-2 py-0.5 font-body text-[10px] font-medium text-forest dark:bg-forest-light/10 dark:text-forest-light">NIN ✓</span>
              )}
              {ride.driver.driverProfile?.licenseVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-forest/10 px-2 py-0.5 font-body text-[10px] font-medium text-forest dark:bg-forest-light/10 dark:text-forest-light">License ✓</span>
              )}
              {ride.driver.driverProfile?.faceVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-forest/10 px-2 py-0.5 font-body text-[10px] font-medium text-forest dark:bg-forest-light/10 dark:text-forest-light">Face ✓</span>
              )}
            </div>
          </div>
          {ride.driver.driverProfile && (
            <div className="text-right font-body text-xs text-muted-foreground">
              <p>{ride.driver.driverProfile.vehicleColor} {ride.driver.driverProfile.vehicleMake}</p>
              <p className="font-medium text-foreground">{ride.driver.driverProfile.plateNumber}</p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      {ride.ratings.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="font-body text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Recent reviews</p>
          <div className="space-y-4">
            {ride.ratings.map((r, i) => (
              <div key={i} className="flex gap-3">
                <div className="font-body text-sm text-amber">{"★".repeat(r.score)}</div>
                <div>
                  <p className="font-body text-sm">{r.comment || "Great ride!"}</p>
                  <p className="font-body text-[10px] text-muted-foreground mt-0.5">{r.fromUser.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking section — client component */}
      {!isOwner && ride.status === "SCHEDULED" && ride.availableSeats > 0 && (
        <RideBookingClient
          rideId={ride.id}
          pricePerSeat={ride.pricePerSeat}
          availableSeats={ride.availableSeats}
          alreadyBooked={alreadyBooked}
          userEmail={user.email}
          userName={user.name}
        />
      )}

      {isOwner && (
        <div className="rounded-xl bg-secondary/50 px-4 py-3 text-center">
          <p className="font-body text-sm text-muted-foreground">This is your ride. {ride.bookings.length} booking(s) so far.</p>
        </div>
      )}
    </div>
  );
}