import prisma from "@/lib/prisma";
import { requireDriver } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNaira, formatTime, formatDate, VEHICLE_TYPES, RIDE_STATUS } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function DriverRidesPage() {
  const user = await requireDriver();
  const rides = await prisma.ride.findMany({
    where: { driverId: user.id },
    include: { _count: { select: { bookings: { where: { status: "CONFIRMED" } } } } },
    orderBy: { departureTime: "desc" },
    take: 30,
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link href="/driver/rides/new"><Button className="bg-amber hover:bg-amber-dark text-ink font-semibold"><Plus className="mr-2 h-4 w-4" />New ride</Button></Link>
      </div>
      {rides.length === 0 ? (
        <Card className="border-dashed"><CardContent className="py-12 text-center"><p className="font-heading text-sm font-semibold">No rides created yet</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {rides.map((ride) => {
            const dep = new Date(ride.departureTime);
            const v = VEHICLE_TYPES[ride.vehicleType];
            const s = RIDE_STATUS[ride.status];
            return (
              <Link key={ride.id} href={`/rides/${ride.id}`}>
                <Card className="cursor-pointer hover:shadow-sm transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-heading text-sm font-bold">{ride.originArea || ride.originAddress} → {ride.destArea || ride.destAddress}</p>
                        <p className="font-body text-xs text-muted-foreground mt-1">{formatDate(dep)} at {formatTime(dep)} • {v.emoji} {v.label}</p>
                      </div>
                      <Badge variant="secondary">{s.label}</Badge>
                    </div>
                    <div className="flex items-center justify-between border-t border-border/50 pt-3 mt-3">
                      <p className="font-body text-xs text-muted-foreground">{ride._count.bookings} booking(s) • {ride.availableSeats}/{ride.totalSeats} seats left</p>
                      <p className="font-heading text-sm font-bold">{formatNaira(ride.pricePerSeat)}/seat</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}