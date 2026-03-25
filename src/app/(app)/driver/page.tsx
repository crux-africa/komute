import { requireDriver } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { addHours, formatDistanceToNow } from "date-fns";
import {
  Wallet,
  TrendingUp,
  Star,
  CheckCircle2,
  MapPin,
  Users,
  ChevronRight,
  ArrowUpRight,
  Car,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(kobo / 100);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-NG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

async function getDriverDashboardData(userId: string) {
  const now = new Date();
  const next24h = addHours(now, 24);

  const [driverProfile, upcomingRides, rideStats, recentRatings, completedRides] =
    await Promise.all([
      prisma.driverProfile.findUnique({
        where: { userId },
        select: { availableBalance: true, totalEarnings: true },
      }),
      prisma.ride.findMany({
        where: {
          driverId: userId,
          status: "SCHEDULED",
          departureTime: { gte: now, lte: next24h },
        },
        include: {
          bookings: {
            where: { status: { in: ["CONFIRMED", "PENDING"] } },
            select: { seats: true, status: true },
          },
        },
        orderBy: { departureTime: "asc" },
        take: 5,
      }),
      prisma.ride.aggregate({
        where: { driverId: userId },
        _count: { id: true },
      }),
      prisma.rating.findMany({
        where: { toUserId: userId },
        select: { score: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.ride.count({
        where: { driverId: userId, status: "COMPLETED" },
      }),
    ]);

  const avgRating =
    recentRatings.length > 0
      ? recentRatings.reduce((s, r) => s + r.score, 0) / recentRatings.length
      : 0;

  const completionRate =
    rideStats._count.id > 0
      ? Math.round((completedRides / rideStats._count.id) * 100)
      : 0;

  return {
    availableBalance: driverProfile?.availableBalance ?? 0,
    totalEarnings: driverProfile?.totalEarnings ?? 0,
    upcomingRides,
    totalRides: rideStats._count.id,
    completedRides,
    avgRating,
    completionRate,
    ratingCount: recentRatings.length,
  };
}

export default async function DriverDashboardPage() {
  const user = await requireDriver();
  const data = await getDriverDashboardData(user.id);
  const firstName = user.firstName || user.name?.split(" ")[0] || "Driver";

  const stats = [
    { label: "Total Rides", value: data.totalRides, icon: Car, suffix: "" },
    { label: "Completed", value: data.completedRides, icon: CheckCircle2, suffix: "" },
    { label: "Rating", value: data.avgRating.toFixed(1), icon: Star, suffix: "/5" },
    { label: "Completion", value: data.completionRate, icon: TrendingUp, suffix: "%" },
  ];

  return (
    <div className="px-4 pt-6 pb-8 max-w-2xl mx-auto space-y-8">

      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Good morning
          </p>
          <h1 className="text-2xl font-bold font-heading text-foreground">
            {firstName} 👋
          </h1>
        </div>
        <Badge className="bg-forest/10 text-forest border-forest/20 font-semibold">
          ● Active
        </Badge>
      </div>

      {/* Earnings card */}
      <section className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">
          Earnings
        </p>
        <div className="relative rounded-2xl bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,rgba(245,158,11,0.2)_0%,transparent_60%)] pointer-events-none" />
          <div className="relative p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-primary-foreground/50 font-medium mb-1.5">
                  Available Balance
                </p>
                <p className="text-4xl font-bold font-heading text-primary-foreground leading-none">
                  {formatNaira(data.availableBalance)}
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-primary-foreground/50">
                <Wallet size={20} />
              </div>
            </div>

            <div className="h-px bg-white/10" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-primary-foreground/40">
                <TrendingUp size={13} />
                <span>Total earned: {formatNaira(data.totalEarnings)}</span>
              </div>
              <Link
                href="/app/driver/earnings"
                className="flex items-center gap-1.5 bg-amber text-amber-dark text-xs font-bold px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
              >
                Withdraw
                <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming rides */}
      <section className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">
          Next 24 Hours
        </p>

        {data.upcomingRides.length > 0 ? (
          <>
            <div className="space-y-2.5">
              {data.upcomingRides.map((ride) => {
                const confirmedSeats = ride.bookings
                  .filter((b) => b.status === "CONFIRMED")
                  .reduce((s, b) => s + b.seats, 0);
                const totalBooked = ride.bookings.reduce((s, b) => s + b.seats, 0);
                const fillPct = Math.round((totalBooked / ride.availableSeats) * 100);

                return (
                  <Link key={ride.id} href={`/app/driver/rides/${ride.id}`}>
                    <Card className="hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer">
                      <CardContent className="p-4 flex items-center gap-3">
                        {/* Time */}
                        <div className="min-w-[52px]">
                          <p className="text-sm font-bold text-foreground leading-tight">
                            {formatTime(ride.departureTime)}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {formatDistanceToNow(ride.departureTime, { addSuffix: true })}
                          </p>
                        </div>

                        {/* Route line */}
                        <div className="flex flex-col items-center gap-0.5 py-0.5">
                          <div className="w-2 h-2 rounded-full bg-amber" />
                          <div className="w-px flex-1 min-h-[16px] bg-border" />
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        </div>

                        {/* Route labels */}
                        <div className="flex-1 flex flex-col gap-1.5 overflow-hidden">
                          <div className="flex items-center gap-1 text-xs font-medium text-amber-dark truncate">
                            <MapPin size={10} />
                            {ride.originArea || ride.originAddress}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                            <MapPin size={10} />
                            {ride.destArea || ride.destAddress}
                          </div>
                        </div>

                        {/* Seat fill */}
                        <div className="flex flex-col items-end gap-1 min-w-[60px]">
                          <div className="flex items-center gap-1 text-xs font-semibold text-foreground">
                            <Users size={12} />
                            {confirmedSeats}/{ride.availableSeats}
                          </div>
                          <div className="w-14 h-1 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-forest rounded-full transition-all"
                              style={{ width: `${fillPct}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            {formatNaira(ride.pricePerSeat)}/seat
                          </p>
                        </div>

                        <ChevronRight size={15} className="text-muted-foreground flex-shrink-0" />
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
            <Link
              href="/app/driver/rides"
              className="flex items-center justify-center gap-1.5 py-3 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              View all rides <ChevronRight size={14} />
            </Link>
          </>
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-8 flex flex-col items-center text-center gap-3">
              <div className="text-3xl">🚗</div>
              <div>
                <p className="font-semibold text-foreground text-sm mb-1">
                  No rides in the next 24h
                </p>
                <p className="text-xs text-muted-foreground">
                  Schedule a ride to start getting bookings
                </p>
              </div>
              <Link
                href="/app/driver/rides/new"
                className="flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity"
              >
                Post a ride
              </Link>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Quick stats */}
      <section className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">
          Quick Stats
        </p>
        <div className="grid grid-cols-4 gap-2.5">
          {stats.map(({ label, value, icon: Icon, suffix }) => (
            <Card key={label}>
              <CardContent className="p-3 flex flex-col items-center text-center gap-1.5">
                <Icon size={15} className="text-forest" />
                <p className="text-lg font-bold font-heading text-foreground leading-none">
                  {value}
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {suffix}
                  </span>
                </p>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  {label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
