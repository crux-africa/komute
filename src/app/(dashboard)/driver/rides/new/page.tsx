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
import { Loader2, CheckCircle2 } from "lucide-react";
import { LAGOS_CORRIDORS } from "@/lib/utils";
import z from "zod";

export default function CreateRidePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  type CreateRideFormValues = z.input<typeof createRideSchema>;

  const { register, handleSubmit, setValue, formState: { errors } } =
    useForm<CreateRideFormValues, unknown, CreateRideInput>({
      resolver: zodResolver(createRideSchema),
      defaultValues: { totalSeats: 3, isRecurring: false },
    });



  function selectCorridor(index: number) {
    const corridors = LAGOS_CORRIDORS[index];
    setValue("originLat", corridors.from.lat);
    setValue("originLng", corridors.from.lng);
    setValue("originAddress", corridors.name.split(" → ")[0]);
    setValue("originArea", corridors.name.split(" → ")[0]);
    setValue("destLat", corridors.to.lat);
    setValue("destLng", corridors.to.lng);
    setValue("destAddress", corridors.name.split(" → ")[1]);
    setValue("destArea", corridors.name.split(" → ")[1]);
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
      <div>
        <p className="font-body text-xs font-semibold text-muted-foreground mb-2">Quick select a corridor</p>
        <div className="flex flex-wrap gap-2">
          {LAGOS_CORRIDORS.map((c, i) => (
            <button key={c.name} onClick={() => selectCorridor(i)} className="rounded-full border border-border px-3 py-1.5 font-body text-xs transition-colors hover:border-forest/30 hover:bg-forest/5 dark:hover:border-forest-light/30">
              {c.name}
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
                <Label className="font-body">Price per seat (₦)</Label>
                <Input type="number" min={100} placeholder="800" onChange={(e) => setValue("pricePerSeat", Number(e.target.value) * 100)} />
                <p className="text-[10px] text-muted-foreground">Enter in Naira</p>
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