"use client";

import { useState, useEffect, ComponentProps } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RideCard } from "@/components/rides/ride-card";
import { Search, MapPin, ArrowRight } from "lucide-react";
import { LAGOS_CORRIDORS } from "@/lib/utils";
import { toast } from "sonner";

type Ride = ComponentProps<typeof RideCard>["ride"];

export default function RiderDashboard() {
  const router = useRouter();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function searchAll() {
      setLoading(true);

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

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    const trimmedFrom = from.trim();
    const trimmedTo = to.trim();

    if (!trimmedFrom && !trimmedTo) {
      return toast.error("Missing trip details", {
        description: "Please enter both your pickup location and destination to search for rides.",
      });
    }

    if (!trimmedFrom) {
      return toast.error("Pickup location required", {
        description: "Please enter where you're departing from to search for available rides.",
      });
    }

    if (!trimmedTo) {
      return toast.error("Destination required", {
        description: "Please enter where you're heading to search for available rides.",
      });
    }

    router.push(`/rider/search?from=${encodeURIComponent(trimmedFrom)}&to=${encodeURIComponent(trimmedTo)}`);
  }

  return (
    <div className="space-y-8">
      {/* Search Card */}
      <Card className="border-forest/20 bg-gradient-to-br from-forest/5 to-transparent dark:from-forest-light/5">
        <CardContent className="p-6">
          <h2 className="font-heading text-xl font-bold mb-1">Where are you heading?</h2>
          <p className="font-body text-sm text-muted-foreground mb-5">Find your ride for tomorrow morning</p>

          <form onSubmit={handleSearch} className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center gap-1">
                <div className="h-2.5 w-2.5 rounded-full bg-forest dark:bg-forest-light" />
                <div className="h-8 w-px bg-border" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber" />
              </div>
              <div className="flex-1 space-y-2">
                <Input placeholder="Pickup — e.g. Ikorodu" value={from} onChange={(e) => setFrom(e.target.value)} className="h-11" />
                <Input placeholder="Destination — e.g. Victoria Island" value={to} onChange={(e) => setTo(e.target.value)} className="h-11" />
              </div>
            </div>
            <Button type="submit" className="w-full h-11 bg-amber hover:bg-amber-dark text-ink font-semibold">
              <Search className="mr-2 h-4 w-4" />
              Search rides
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Quick corridors */}
      <div>
        <h3 className="font-heading text-sm font-semibold text-muted-foreground mb-3">Popular corridors</h3>
        <div className="flex flex-wrap gap-2">
          {LAGOS_CORRIDORS.slice(0, 6).map((c) => (
            <button
              key={c.name}
              onClick={() => router.push(`/rider/search?fromLat=${c.from.lat}&fromLng=${c.from.lng}&toLat=${c.to.lat}&toLng=${c.to.lng}`)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 font-body text-xs font-medium text-muted-foreground transition-colors hover:border-forest/30 hover:bg-forest/5 hover:text-foreground dark:hover:border-forest-light/30"
            >
              <MapPin className="h-3 w-3" />
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Available rides */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-base font-bold">Available rides</h3>
          <Button variant="ghost" size="sm" className="font-body text-xs" onClick={() => router.push("/rider/search")}>
            See all <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}><CardContent className="p-4"><Skeleton className="h-32 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : rides.length > 0 ? (
          <div className="flex flex-col gap-4">
            {rides.slice(0, 3).map((ride) => (
              <RideCard key={ride.id} ride={ride} />
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center py-12 text-center">
              <Search className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="font-heading text-sm font-semibold">No rides found yet</p>
              <p className="font-body text-xs text-muted-foreground mt-1">Try searching a specific route or check back later</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}