"use client";

import { useState, useEffect, useCallback, ComponentProps } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RideCard } from "@/components/rides/ride-card";
import { Search } from "lucide-react";
import { LAGOS_CORRIDORS } from "@/lib/utils";
// import { Ride } from "@/generated/prisma/client";

type Ride = ComponentProps<typeof RideCard>["ride"];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fromLat = searchParams.get("fromLat");
  const fromLng = searchParams.get("fromLng");
  const toLat = searchParams.get("toLat");
  const toLng = searchParams.get("toLng");

  const doSearch = useCallback(async (fLat: string, fLng: string, tLat: string, tLng: string) => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(
        `/api/rides?fromLat=${fLat}&fromLng=${fLng}&toLat=${tLat}&toLng=${tLng}&maxDistance=5`
      );
      const data = await res.json();
      setRides(data.rides || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (fromLat && fromLng && toLat && toLng) {
      void doSearch(fromLat, fromLng, toLat, toLng);
    }
  }, [fromLat, fromLng, toLat, toLng, doSearch]);

  function searchCorridor(index: number) {
    const c = LAGOS_CORRIDORS[index];
    doSearch(String(c.from.lat), String(c.from.lng), String(c.to.lat), String(c.to.lng));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {LAGOS_CORRIDORS.map((c, i) => (
          <button key={c.name} onClick={() => searchCorridor(i)} className="rounded-full border border-border px-3 py-1.5 font-body text-xs transition-colors hover:border-forest/30 hover:bg-forest/5 dark:hover:border-forest-light/30">{c.name}</button>
        ))}
      </div>

      {loading && <div className="space-y-3">{[1, 2, 3].map(i => <Card key={i}><CardContent className="p-4"><Skeleton className="h-32" /></CardContent></Card>)}</div>}

      {!loading && searched && rides.length === 0 && (
        <Card className="border-dashed"><CardContent className="py-12 text-center">
          <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-heading text-sm font-semibold">No rides found on this route</p>
          <p className="font-body text-xs text-muted-foreground mt-1">Try a different corridor or check back later</p>
        </CardContent></Card>
      )}

      {!loading && rides.length > 0 && (
        <div className="space-y-3">
          <p className="font-body text-sm text-muted-foreground">{rides.length} ride(s) found</p>
          {rides.map((ride) => <RideCard key={ride.id} ride={ride} />)}
        </div>
      )}
    </div>
  );
}