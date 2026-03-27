import { z } from "zod";

export const createRideSchema = z.object({
  originLat: z.number().min(-90).max(90),
  originLng: z.number().min(-180).max(180),
  originAddress: z.string().min(3, "Enter pickup address"),
  originArea: z.string().optional(),
  destLat: z.number().min(-90).max(90),
  destLng: z.number().min(-180).max(180),
  destAddress: z.string().min(3, "Enter destination address"),
  destArea: z.string().optional(),
  departureTime: z.string().datetime({ message: "Select departure time" }),
  totalSeats: z.coerce.number().int().min(1, "At least 1 seat").max(14, "Max 14 seats"),
  pricePerSeat: z.coerce.number().int().min(10000, "Minimum ₦100 per seat"), // in kobo
  vehicleType: z.enum(["CAR", "SHUTTLE", "KEKE"]),
  isRecurring: z.boolean().default(false),
  recurringDays: z.string().optional(),
  notes: z.string().max(200).optional(),
});

export const searchRidesSchema = z.object({
  fromLat: z.coerce.number(),
  fromLng: z.coerce.number(),
  toLat: z.coerce.number(),
  toLng: z.coerce.number(),
  date: z.string().optional(),
  maxDistance: z.coerce.number().default(3),
});

export const bookRideSchema = z.object({
  rideId: z.string().min(1),
  seats: z.coerce.number().int().min(1).max(14).default(1),
  txnRef: z.string().min(1, "Payment reference required"),
  provider: z.enum(["interswitch", "paystack"]).default("paystack"),
});

export type CreateRideInput = z.infer<typeof createRideSchema>;
export type SearchRidesInput = z.infer<typeof searchRidesSchema>;
export type BookRideInput = z.infer<typeof bookRideSchema>;