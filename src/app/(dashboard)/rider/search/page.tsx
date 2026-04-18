"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RideCard } from "@/components/rides/ride-card";
import { Search } from "lucide-react";
import { LAGOS_CORRIDORS } from "@/lib/utils";

interface RideResult {
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
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [rides, setRides] = useState<RideResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fromLat = searchParams.get("fromLat");
  const fromLng = searchParams.get("fromLng");
  const toLat = searchParams.get("toLat");
  const toLng = searchParams.get("toLng");
  const fromText = searchParams.get("from");
  const toText = searchParams.get("to");

  // search for all
  useEffect(() => {
    async function searchAll() {
      setLoading(true);
      setSearched(true);

      try {
        const res = await fetch(`/api/rides`);
        const data = await res.json();

        setRides(data.rides || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    searchAll();
  }, []);

  // Auto-search when params exist
  useEffect(() => {
    console.log('hello world')
    if (fromLat && fromLng && toLat && toLng) {
      searchByCoords(fromLat, fromLng, toLat, toLng);
    } else if (fromText || toText) {
      searchByText(fromText || "", toText || "");
    }
  }, [fromLat, fromLng, toLat, toLng, fromText, toText]);

  async function searchByCoords(fLat: string, fLng: string, tLat: string, tLng: string) {
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(
        `/api/rides?fromLat=${fLat}&fromLng=${fLng}&toLat=${tLat}&toLng=${tLng}&maxDistance=10`
      );
      const data = await res.json();

      console.log(data)
      setRides(data.rides || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function searchByText(from: string, to: string) {
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const res = await fetch(`/api/rides?${params.toString()}`);
      const data = await res.json();
      setRides(data.rides || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function searchCorridor(index: number) {
    const corridors = LAGOS_CORRIDORS[index];
    searchByCoords(
      String(corridors.from.lat),
      String(corridors.from.lng),
      String(corridors.to.lat),
      String(corridors.to.lng)
    );
  }

  return (
    <div className="space-y-6">
      {/* Show what was searched */}
      {(fromText || toText) && (
        <div className="rounded-lg bg-secondary/50 px-4 py-3">
          <p className="font-body text-sm text-muted-foreground">
            Showing rides
            {fromText && <> from <span className="font-medium text-foreground">{fromText}</span></>}
            {toText && <> to <span className="font-medium text-foreground">{toText}</span></>}
          </p>
        </div>
      )}

      {/* Corridor quick filters */}
      <div className="flex flex-wrap gap-2">
        {LAGOS_CORRIDORS.map((corridors, i) => (
          <button
            key={corridors.name}
            onClick={() => searchCorridor(i)}
            className="rounded-full border border-border px-3 py-1.5 font-body text-xs transition-colors hover:border-forest/30 hover:bg-forest/5 dark:hover:border-forest-light/30"
          >
            {corridors.name}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No results */}
      {!loading && searched && rides.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-heading text-sm font-semibold">
              No rides found on this route
            </p>
            <p className="font-body text-xs text-muted-foreground mt-1">
              Try a different corridor or check back later
            </p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {!loading && rides.length > 0 && (
        <div className="space-y-3">
          <p className="font-body text-sm text-muted-foreground">
            {rides.length} ride{rides.length !== 1 ? "s" : ""} found
          </p>
          {rides.map((ride) => (
            <RideCard key={ride.id} ride={ride} />
          ))}
        </div>
      )}

      {/* Initial state — no search yet */}
      {!loading && !searched && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-heading text-sm font-semibold">
              Select a corridor above or search from the home page
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}