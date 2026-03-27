import prisma from "@/lib/prisma";
import { requireDriver } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { formatNaira } from "@/lib/utils";
import { Wallet, TrendingUp, Car } from "lucide-react";

export default async function EarningsPage() {
  const user = await requireDriver();
  const profile = await prisma.driverProfile.findUnique({ where: { userId: user.id } });
  const confirmedBookings = await prisma.booking.findMany({
    where: { ride: { driverId: user.id }, status: { in: ["CONFIRMED", "COMPLETED"] } },
    select: { totalPrice: true, seats: true },
  });

  const totalEarnings = confirmedBookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const totalPassengers = confirmedBookings.reduce((sum, b) => sum + b.seats, 0);
  const commission = Math.round(totalEarnings * 0.1);
  const netEarnings = totalEarnings - commission;

  return (
    <div className="space-y-6 max-w-lg">
      <Card className="border-forest/30 bg-forest/5 dark:bg-forest-light/5">
        <CardContent className="p-6 text-center">
          <Wallet className="h-8 w-8 text-forest dark:text-forest-light mx-auto mb-3" />
          <p className="font-body text-xs text-muted-foreground">Available balance</p>
          <p className="font-heading text-4xl font-extrabold text-forest dark:text-forest-light mt-1">{formatNaira(profile?.availableBalance || 0)}</p>
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 gap-4">
        <Card><CardContent className="p-5">
          <TrendingUp className="h-5 w-5 text-amber mb-2" />
          <p className="font-body text-xs text-muted-foreground">Total earned</p>
          <p className="font-heading text-xl font-bold mt-0.5">{formatNaira(netEarnings)}</p>
          <p className="font-body text-[10px] text-muted-foreground mt-0.5">after 10% platform fee</p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <Car className="h-5 w-5 text-terra dark:text-terra-light mb-2" />
          <p className="font-body text-xs text-muted-foreground">Passengers served</p>
          <p className="font-heading text-xl font-bold mt-0.5">{totalPassengers}</p>
        </CardContent></Card>
      </div>
    </div>
  );
}