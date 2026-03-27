import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// ============================================
// SHADCN UTILITY
// ============================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================
// DISTANCE CALCULATION
// ============================================

export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// ============================================
// FORMATTING
// ============================================

export function formatNaira(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString("en-NG")}`;
}

export function formatPhone(phone: string): string {
  if (phone.startsWith("+234")) {
    return "0" + phone.slice(4);
  }
  return phone;
}

export function maskPhone(phone: string): string {
  const formatted = formatPhone(phone);
  return formatted.slice(0, 5) + "***" + formatted.slice(-3);
}

export function timeUntil(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  if (diff < 0) return "now";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) return `${Math.floor(hours / 24)}d`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-NG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-NG", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// ============================================
// CONSTANTS
// ============================================

export const VEHICLE_TYPES = {
  CAR: { label: "Private Car", emoji: "🚗", maxSeats: 4 },
  SHUTTLE: { label: "Shuttle", emoji: "🚌", maxSeats: 14 },
  KEKE: { label: "Keke", emoji: "🛺", maxSeats: 3 },
} as const;

export const RIDE_STATUS = {
  SCHEDULED: { label: "Scheduled", color: "blue" },
  IN_PROGRESS: { label: "In Progress", color: "green" },
  COMPLETED: { label: "Completed", color: "gray" },
  CANCELLED: { label: "Cancelled", color: "red" },
} as const;

export const MATCHING = {
  MAX_ORIGIN_DISTANCE_KM: 2,
  MAX_DEST_DISTANCE_KM: 3,
  TIME_WINDOW_MINUTES: 30,
} as const;

export const LAGOS_CORRIDORS = [
  {
    name: "Ikorodu → Island",
    from: { lat: 6.6194, lng: 3.5105 },
    to: { lat: 6.4281, lng: 3.4219 },
    pricePerSeat: 80000, // ₦800
    estimatedDistance: 18, // km
  },
  {
    name: "Ajah → Victoria Island",
    from: { lat: 6.4698, lng: 3.5852 },
    to: { lat: 6.4281, lng: 3.4219 },
    pricePerSeat: 50000, // ₦500
    estimatedDistance: 8,
  },
  {
    name: "Berger → Ikeja",
    from: { lat: 6.6018, lng: 3.3515 },
    to: { lat: 6.5955, lng: 3.3421 },
    pricePerSeat: 30000, // ₦300
    estimatedDistance: 5,
  },
  {
    name: "Mowe/Ibafo → Ikeja",
    from: { lat: 6.81, lng: 3.44 },
    to: { lat: 6.5955, lng: 3.3421 },
    pricePerSeat: 100000, // ₦1000
    estimatedDistance: 25,
  },
  {
    name: "Ojo → Apapa",
    from: { lat: 6.4579, lng: 3.1818 },
    to: { lat: 6.4488, lng: 3.3597 },
    pricePerSeat: 40000, // ₦400
    estimatedDistance: 7,
  },
  {
    name: "Lekki → Ikeja",
    from: { lat: 6.4478, lng: 3.4723 },
    to: { lat: 6.5955, lng: 3.3421 },
    pricePerSeat: 60000, // ₦600
    estimatedDistance: 12,
  },
] as const;

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function calculatePrice(distance: number): number {
  const baseRate = 3000; // ₦30 per km base rate
  const minPrice = 20000; // ₦200 minimum
  const maxPrice = 150000; // ₦1500 maximum
  const calculated = Math.round((distance * baseRate + minPrice) / 100) * 100;
  return Math.min(Math.max(calculated, minPrice), maxPrice);
}

export const NIGERIAN_BANKS = [
  { code: "044", name: "Access Bank" },
  { code: "023", name: "Citibank" },
  { code: "050", name: "Ecobank" },
  { code: "070", name: "Fidelity Bank" },
  { code: "011", name: "First Bank" },
  { code: "214", name: "First City Monument Bank" },
  { code: "058", name: "Guaranty Trust Bank" },
  { code: "030", name: "Heritage Bank" },
  { code: "301", name: "Jaiz Bank" },
  { code: "082", name: "Keystone Bank" },
  { code: "526", name: "Kuda Microfinance Bank" },
  { code: "999", name: "Moniepoint" },
  { code: "221", name: "Stanbic IBTC Bank" },
  { code: "068", name: "Standard Chartered Bank" },
  { code: "232", name: "Sterling Bank" },
  { code: "032", name: "Union Bank" },
  { code: "033", name: "United Bank for Africa" },
  { code: "215", name: "Unity Bank" },
  { code: "035", name: "Wema Bank" },
  { code: "057", name: "Zenith Bank" },
  { code: "100", name: "Opay" },
  { code: "305", name: "PalmPay" },
] as const;