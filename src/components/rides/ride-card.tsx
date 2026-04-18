"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, Users, Shield, ChevronRight } from "lucide-react";
import { formatNaira, VEHICLE_TYPES, formatTime } from "@/lib/utils";

interface RideCardProps {
  ride: {
    id: string;
    originAddress: string;
    originArea?: string | null;
    destAddress: string;
    destArea?: string | null;
    departureTime: string;
    availableSeats: number;
    totalSeats: number;
    pricePerSeat: number;
    vehicleType: "CAR" | "SHUTTLE" | "KEKE";
    originDistance?: number;
    driver: {
      id: string;
      name?: string | null;
      rating: number;
      ratingCount: number;
      ninVerified: boolean;
      driverProfile?: {
        vehicleMake?: string | null;
        vehicleModel?: string | null;
        vehicleColor?: string | null;
        licenseVerified: boolean;
        faceVerified: boolean;
      } | null;
    };
  };
}

export function RideCard({ ride }: RideCardProps) {
  const vehicle = VEHICLE_TYPES[ride.vehicleType];
  const departure = new Date(ride.departureTime);
  const driverName = ride.driver.name || "Driver";
  const initials = driverName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const isVerified = ride.driver.ninVerified && ride.driver.driverProfile?.licenseVerified;

  return (
    <Link href={`/rides/${ride.id}`} className="block">
      <Card className="group cursor-pointer border-border/50 transition-all hover:border-forest/30 hover:shadow-md hover:shadow-forest/5 dark:hover:border-forest-light/30">
        <CardContent className="p-4">
          {/* Top: Driver + Price */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarFallback className="bg-forest/10 font-heading text-xs font-bold text-forest dark:bg-forest-light/10 dark:text-forest-light">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {isVerified && (
                  <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-forest text-[#FAFAF8]">
                    <Shield className="h-2.5 w-2.5" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-heading text-sm font-semibold">{driverName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-body text-xs text-amber-dark dark:text-amber">
                    ★ {ride.driver.rating > 0 ? ride.driver.rating.toFixed(1) : "New"}
                  </span>
                  <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 h-4 ${ride.vehicleType === "CAR" ? "badge-car" :
                    ride.vehicleType === "SHUTTLE" ? "badge-shuttle" : "badge-keke"
                    }`}>
                    {vehicle.emoji} {vehicle.label}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="font-heading text-lg font-bold text-forest dark:text-forest-light">
                {formatNaira(ride.pricePerSeat)}
              </p>
              <p className="font-body text-[10px] text-muted-foreground">per seat</p>
            </div>
          </div>

          {/* Route */}
          <div className="mt-4 flex items-start gap-3">
            <div className="mt-1 flex flex-col items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-forest dark:bg-forest-light" />
              <div className="h-6 w-px bg-border" />
              <div className="h-2 w-2 rounded-full bg-amber" />
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <p className="font-body text-sm font-medium">{ride.originArea || ride.originAddress}</p>
                {ride.originDistance !== undefined && (
                  <p className="font-body text-[10px] text-muted-foreground">{ride.originDistance}km from you</p>
                )}
              </div>
              <div>
                <p className="font-body text-sm font-medium">{ride.destArea || ride.destAddress}</p>
              </div>
            </div>
          </div>

          {/* Bottom: Time + Seats */}
          <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span className="font-body text-xs font-medium">{formatTime(departure)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span className="font-body text-xs">
                  <span className="font-medium text-foreground">{ride.availableSeats}</span>/{ride.totalSeats} seats
                </span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}