// import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireDriver } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { formatNaira } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Car, Wallet, Users } from "lucide-react";

export default async function DriverDashboard() {
  const user = await requireDriver();

  const [activeRides, totalBookings, profile] = await Promise.all([
    prisma.ride.count({ where: { driverId: user.id, status: "SCHEDULED" } }),
    prisma.booking.count({ where: { ride: { driverId: user.id }, status: "CONFIRMED" } }),
    prisma.driverProfile.findUnique({ where: { userId: user.id } }),
  ]);

  // const earnings = profile?.totalEarnings || 0;
  const balance = profile?.availableBalance || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold">Welcome back, {user.firstName || "Driver"}</h2>
          <p className="font-body text-sm text-muted-foreground mt-0.5">Here&apos;s how your rides are doing</p>
        </div>
        <Link href="/driver/rides/new">
          <Button className="bg-amber hover:bg-amber-dark text-ink font-semibold">
            <Plus className="mr-2 h-4 w-4" />Offer a ride
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-forest/10 dark:bg-forest-light/10">
                <Car className="h-5 w-5 text-forest dark:text-forest-light" />
              </div>
              <div>
                <p className="font-body text-xs text-muted-foreground">Active rides</p>
                <p className="font-heading text-2xl font-bold">{activeRides}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber/10">
                <Users className="h-5 w-5 text-amber-dark dark:text-amber" />
              </div>
              <div>
                <p className="font-body text-xs text-muted-foreground">Total bookings</p>
                <p className="font-heading text-2xl font-bold">{totalBookings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-terra/10">
                <Wallet className="h-5 w-5 text-terra dark:text-terra-light" />
              </div>
              <div>
                <p className="font-body text-xs text-muted-foreground">Available balance</p>
                <p className="font-heading text-2xl font-bold">{formatNaira(balance)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center py-12 text-center">
          <Car className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="font-heading text-sm font-semibold">Offer your first ride</p>
          <p className="font-body text-xs text-muted-foreground mt-1 max-w-xs">List your daily commute route and fill your empty seats. Earn while you drive to work.</p>
          <Link href="/driver/rides/new"><Button className="mt-4 bg-forest hover:bg-forest-light text-[#FAFAF8]">Create ride</Button></Link>
        </CardContent>
      </Card>
    </div>
  );
}