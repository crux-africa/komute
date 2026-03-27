"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createRideSchema, type CreateRideInput } from "@/lib/validations/ride";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2, MapPin } from "lucide-react";
import { LAGOS_CORRIDORS, formatNaira } from "@/lib/utils";
import z from "zod";

export default function CreateRidePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  type CreateRideFormValues = z.input<typeof createRideSchema>;

  const { register, handleSubmit, setValue, watch, formState: { errors } } =
    useForm<CreateRideFormValues, unknown, CreateRideInput>({
      resolver: zodResolver(createRideSchema),
      defaultValues: { totalSeats: 3, isRecurring: false, pricePerSeat: 20000 },
    });

  const selectedPrice = watch("pricePerSeat");

  function selectCorridor(corridor: typeof LAGOS_CORRIDORS[number]) {
    setValue("originLat", corridor.from.lat);
    setValue("originLng", corridor.from.lng);
    setValue("originAddress", corridor.name.split(" → ")[0]);
    setValue("originArea", corridor.name.split(" → ")[0]);
    setValue("destLat", corridor.to.lat);
    setValue("destLng", corridor.to.lng);
    setValue("destAddress", corridor.name.split(" → ")[1]);
    setValue("destArea", corridor.name.split(" → ")[1]);
    setValue("pricePerSeat", corridor.pricePerSeat);
  }

  async function onSubmit(data: CreateRideInput) {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/rides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setSuccess(true);
      setTimeout(() => router.push("/driver/rides"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create ride");
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="flex flex-col items-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-forest/10 dark:bg-forest-light/10 mb-4">
            <CheckCircle2 className="h-8 w-8 text-forest dark:text-forest-light" />
          </div>
          <h2 className="font-heading text-xl font-bold">Ride published!</h2>
          <p className="font-body text-sm text-muted-foreground mt-2">
            Commuters on your route can now book seats.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Quick route selector */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <p className="font-body text-xs font-semibold text-muted-foreground">Popular Routes</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {LAGOS_CORRIDORS.map((corridor) => (
            <button
              key={corridor.name}
              onClick={() => selectCorridor(corridor)}
              className="flex flex-col items-start p-3 rounded-lg border border-border bg-card hover:border-forest/50 hover:bg-forest/5 transition-all text-left"
            >
              <span className="font-body text-xs font-medium text-foreground truncate w-full">{corridor.name}</span>
              <span className="font-heading text-sm font-bold text-forest mt-1">{formatNaira(corridor.pricePerSeat)}</span>
              <span className="font-body text-[10px] text-muted-foreground">{corridor.estimatedDistance}km</span>
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">Offer a ride</CardTitle>
          <CardDescription className="font-body">Fill your empty seats and offset your fuel costs</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Route */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-body">Pickup area</Label>
                <Input placeholder="e.g. Ikorodu" {...register("originAddress")} />
                {errors.originAddress && <p className="text-xs text-destructive">{errors.originAddress.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="font-body">Destination area</Label>
                <Input placeholder="e.g. Victoria Island" {...register("destAddress")} />
                {errors.destAddress && <p className="text-xs text-destructive">{errors.destAddress.message}</p>}
              </div>
            </div>

            {/* Hidden lat/lng — set by corridor selector or map later */}
            <input type="hidden" {...register("originLat", { valueAsNumber: true })} />
            <input type="hidden" {...register("originLng", { valueAsNumber: true })} />
            <input type="hidden" {...register("destLat", { valueAsNumber: true })} />
            <input type="hidden" {...register("destLng", { valueAsNumber: true })} />

            {/* Departure */}
            <div className="space-y-2">
              <Label className="font-body">Departure time</Label>
              <Input type="datetime-local" {...register("departureTime")} />
              {errors.departureTime && <p className="text-xs text-destructive">{errors.departureTime.message}</p>}
            </div>

            {/* Vehicle + Seats */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label className="font-body">Vehicle type</Label>
                <Select onValueChange={(v) => setValue("vehicleType", v as "CAR" | "SHUTTLE" | "KEKE")}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CAR">🚗 Private Car</SelectItem>
                    <SelectItem value="SHUTTLE">🚌 Shuttle</SelectItem>
                    <SelectItem value="KEKE">🛺 Keke</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-body">Available seats</Label>
                <Input type="number" min={1} max={14} placeholder="3" {...register("totalSeats")} />
              </div>
              <div className="space-y-2">
                <Label className="font-body">Price per seat</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-body">₦</span>
                  <Input 
                    type="number" 
                    min={100} 
                    className="pl-7 font-heading font-semibold"
                    {...register("pricePerSeat", { valueAsNumber: true })} 
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">Affordable prices help fill your seats</p>
              </div>
            </div>

            {/* Recurring */}
            <div className="flex items-center gap-3">
              <input type="checkbox" id="recurring" className="h-4 w-4 rounded border-border accent-forest" {...register("isRecurring")} />
              <Label htmlFor="recurring" className="font-body text-sm">Repeat this ride Mon–Fri</Label>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="font-body">Notes (optional)</Label>
              <Textarea placeholder="e.g. AC in the car, leaving from Total filling station" maxLength={200} {...register("notes")} className="h-20 resize-none" />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 font-body text-sm text-destructive">{error}</div>
            )}

            <Button type="submit" className="w-full h-12 bg-forest hover:bg-forest-light text-[#FAFAF8] font-semibold text-base" disabled={isLoading}>
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Publishing...</> : <>Publish ride</>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}