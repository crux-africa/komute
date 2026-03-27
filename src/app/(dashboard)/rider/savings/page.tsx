import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { formatNaira } from "@/lib/utils";
import { PiggyBank, TrendingDown, Wallet } from "lucide-react";

export default async function SavingsPage() {
  const user = await requireAuth();
  const bookings = await prisma.booking.findMany({
    where: { riderId: user.id, status: { in: ["CONFIRMED", "COMPLETED"] } },
    select: { totalPrice: true },
  });

  const totalSpent = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const boltEstimate = totalSpent * 3;
  const saved = boltEstimate - totalSpent;

  return (
    <div className="space-y-6 max-w-lg">
      <div className="grid gap-4">
        <Card className="border-amber/30 bg-amber/5">
          <CardContent className="p-6 text-center">
            <PiggyBank className="h-8 w-8 text-amber mx-auto mb-3" />
            <p className="font-body text-xs text-muted-foreground">Total saved vs Bolt</p>
            <p className="font-heading text-4xl font-extrabold text-amber-dark dark:text-amber mt-1">{formatNaira(saved)}</p>
            <p className="font-body text-xs text-muted-foreground mt-2">across {bookings.length} ride(s)</p>
          </CardContent>
        </Card>
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-5">
              <Wallet className="h-5 w-5 text-forest dark:text-forest-light mb-2" />
              <p className="font-body text-xs text-muted-foreground">Spent on Komute</p>
              <p className="font-heading text-xl font-bold mt-0.5">{formatNaira(totalSpent)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <TrendingDown className="h-5 w-5 text-terra dark:text-terra-light mb-2" />
              <p className="font-body text-xs text-muted-foreground">Would&apos;ve cost on Bolt</p>
              <p className="font-heading text-xl font-bold mt-0.5">{formatNaira(boltEstimate)}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}