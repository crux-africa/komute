import prisma from "@/lib/prisma";
import { requireDriver } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNaira, formatDate } from "@/lib/utils";
import { Wallet, TrendingUp, Car, Users, Calendar, ArrowUpRight, ArrowDownRight, Clock, Percent } from "lucide-react";

export default async function EarningsPage() {
  const user = await requireDriver();
  
  const [
    profile,
    rides,
    bookings,
    recentTransactions
  ] = await Promise.all([
    prisma.driverProfile.findUnique({ where: { userId: user.id } }),
    prisma.ride.findMany({
      where: { driverId: user.id },
      select: { 
        id: true, 
        status: true, 
        originArea: true, 
        destArea: true,
        departureTime: true,
        totalSeats: true,
        pricePerSeat: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.booking.findMany({
      where: { ride: { driverId: user.id }, status: { in: ["CONFIRMED", "COMPLETED"] } },
      select: { 
        id: true,
        totalPrice: true, 
        seats: true, 
        createdAt: true,
        status: true,
        ride: { select: { originArea: true, destArea: true, departureTime: true } },
        rider: { select: { name: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.walletTransaction.findMany({
      where: { wallet: { userId: user.id }, type: { in: ["RIDE_EARNING"] } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const totalEarnings = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const totalPassengers = bookings.reduce((sum, b) => sum + b.seats, 0);
  const totalRides = rides.filter(r => r.status === "COMPLETED").length;
  const commission = Math.round(totalEarnings * 0.1);
  const netEarnings = totalEarnings - commission;

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <Card className="border-forest/30 bg-gradient-to-br from-forest to-forest-light dark:from-forest-light dark:to-forest">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-white/80">
              <Wallet className="h-5 w-5" />
              <span className="font-body text-sm">Available Balance</span>
            </div>
            <Badge className="bg-white/20 text-white border-0 font-body text-xs">
              <Percent className="h-3 w-3 mr-1" />
              10% Platform Fee
            </Badge>
          </div>
          <p className="font-heading text-4xl font-extrabold text-white mt-1">
            {formatNaira(profile?.availableBalance || 0)}
          </p>
          <p className="font-body text-xs text-white/60 mt-1">
            Withdraw to your bank account
          </p>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-amber/10 to-amber/5 border-amber/20">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 text-amber mx-auto mb-2" />
            <p className="font-heading text-2xl font-bold">{formatNaira(netEarnings)}</p>
            <p className="font-body text-xs text-muted-foreground mt-1">Total Earned</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-forest/10 to-forest/5 border-forest/20">
          <CardContent className="p-4 text-center">
            <Car className="h-6 w-6 text-forest mx-auto mb-2" />
            <p className="font-heading text-2xl font-bold">{totalRides}</p>
            <p className="font-body text-xs text-muted-foreground mt-1">Completed Rides</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-terra/10 to-terra/5 border-terra/20">
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 text-terra mx-auto mb-2" />
            <p className="font-heading text-2xl font-bold">{totalPassengers}</p>
            <p className="font-body text-xs text-muted-foreground mt-1">Passengers</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="p-4 text-center">
            <Calendar className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <p className="font-heading text-2xl font-bold">{rides.length}</p>
            <p className="font-body text-xs text-muted-foreground mt-1">Active Rides</p>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Breakdown */}
      <Card>
        <CardContent className="p-5">
          <h3 className="font-heading text-sm font-semibold mb-4">Earnings Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ArrowUpRight className="h-4 w-4 text-forest" />
                <span className="font-body text-sm">Gross Earnings</span>
              </div>
              <span className="font-heading font-semibold">{formatNaira(totalEarnings)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Percent className="h-4 w-4 text-amber" />
                <span className="font-body text-sm">Platform Fee (10%)</span>
              </div>
              <span className="font-heading font-semibold text-amber">-{formatNaira(commission)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-forest" />
                <span className="font-body text-sm font-medium">Net Earnings</span>
              </div>
              <span className="font-heading text-lg font-bold text-forest">{formatNaira(netEarnings)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Bookings */}
      <Card>
        <CardContent className="p-5">
          <h3 className="font-heading text-sm font-semibold mb-4">Recent Bookings</h3>
          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <Car className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-body text-sm text-muted-foreground">No bookings yet</p>
              <p className="font-body text-xs text-muted-foreground/60 mt-1">Start offering rides to get bookings</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest/10">
                      <span className="font-heading text-sm font-bold text-forest">
                        {booking.seats}
                      </span>
                    </div>
                    <div>
                      <p className="font-body text-sm font-medium">
                        {booking.ride.originArea} → {booking.ride.destArea}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="font-body text-xs text-muted-foreground">
                          {formatDate(booking.ride.departureTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-heading font-semibold text-forest">
                      +{formatNaira(booking.totalPrice - Math.round(booking.totalPrice * 0.1))}
                    </p>
                    <Badge 
                      variant="secondary" 
                      className={`text-[10px] ${booking.status === "COMPLETED" ? "bg-terra/10 text-terra" : "bg-amber/10 text-amber"}`}
                    >
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Rides */}
      <Card>
        <CardContent className="p-5">
          <h3 className="font-heading text-sm font-semibold mb-4">My Rides</h3>
          {rides.length === 0 ? (
            <div className="text-center py-8">
              <Car className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-body text-sm text-muted-foreground">No rides created</p>
              <p className="font-body text-xs text-muted-foreground/60 mt-1">Create your first ride to start earning</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rides.map((ride) => (
                <div key={ride.id} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      ride.status === "SCHEDULED" ? "bg-amber/10" :
                      ride.status === "COMPLETED" ? "bg-terra/10" :
                      "bg-muted"
                    }`}>
                      <Car className={`h-5 w-5 ${
                        ride.status === "SCHEDULED" ? "text-amber" :
                        ride.status === "COMPLETED" ? "text-terra" :
                        "text-muted-foreground"
                      }`} />
                    </div>
                    <div>
                      <p className="font-body text-sm font-medium">
                        {ride.originArea} → {ride.destArea}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-body text-xs text-muted-foreground">
                          {formatNaira(ride.pricePerSeat || 0)}/seat
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="font-body text-xs text-muted-foreground">
                          {ride.totalSeats} seats
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-body text-xs text-muted-foreground">
                      {formatDate(ride.createdAt)}
                    </p>
                    <Badge 
                      variant="secondary" 
                      className={`text-[10px] ${
                        ride.status === "SCHEDULED" ? "bg-amber/10 text-amber" :
                        ride.status === "COMPLETED" ? "bg-terra/10 text-terra" :
                        "bg-muted"
                      }`}
                    >
                      {ride.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
