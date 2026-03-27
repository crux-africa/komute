import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const PAYSTACK_API_URL = "https://api.paystack.co";
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

// Cache time: 24 hours
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;

interface PaystackBank {
  id: number;
  name: string;
  slug: string;
  code: string;
  longcode: string;
  gateway: string | null;
  pay_with_bank: boolean;
  active: boolean;
  is_deleted: boolean;
  country: string;
  currency: string;
  type: string;
  seats?: unknown[] | null;
  logo?: string;
  token?: string;
}

interface BankCache {
  banks: PaystackBank[];
  cachedAt: number;
}

let cachedBanks: BankCache | null = null;

async function fetchBanksFromPaystack(): Promise<PaystackBank[]> {
  try {
    const response = await fetch(`${PAYSTACK_API_URL}/bank`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Paystack API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.status) {
      throw new Error(data.message || "Failed to fetch banks");
    }

    return data.data;
  } catch (error) {
    console.error("Error fetching banks from Paystack:", error);
    throw error;
  }
}

function isCacheValid(): boolean {
  if (!cachedBanks) return false;
  return Date.now() - cachedBanks.cachedAt < CACHE_DURATION_MS;
}

async function getNigerianBanks() {
  // Check cache first
  if (isCacheValid() && cachedBanks) {
    return cachedBanks.banks;
  }

  // Fetch from Paystack
  const banks = await fetchBanksFromPaystack();
  
  // Filter only Nigerian banks
  const nigerianBanks = banks.filter(
    (bank: PaystackBank) => 
      bank.country?.toLowerCase() === "nigeria" && 
      bank.active && 
      !bank.is_deleted
  );

  // Update cache
  cachedBanks = {
    banks: nigerianBanks,
    cachedAt: Date.now(),
  };

  return nigerianBanks;
}

// GET /api/banks — Get list of Nigerian banks
export async function GET(req: Request) {
  try {
    let banks = await getNigerianBanks();
    
    // Remove duplicates by code
    const seen = new Set<string>();
    banks = banks.filter((bank: PaystackBank) => {
      if (seen.has(bank.code)) {
        return false;
      }
      seen.add(bank.code);
      return true;
    });
    
    // Sort by name
    banks.sort((a: PaystackBank, b: PaystackBank) => a.name.localeCompare(b.name));

    return NextResponse.json({
      success: true,
      banks: banks.map((bank: PaystackBank) => ({
        id: bank.id,
        name: bank.name,
        code: bank.code,
        longcode: bank.longcode,
        type: bank.type,
        country: bank.country,
        currency: bank.currency,
        active: bank.active,
      })),
      cached: cachedBanks?.cachedAt ? new Date(cachedBanks.cachedAt).toISOString() : null,
    });
  } catch (error) {
    console.error("Error fetching banks:", error);
    
    // Return fallback list if API fails
    return NextResponse.json({
      success: false,
      error: "Failed to fetch banks from Paystack",
      fallback: true,
      banks: FALLBACK_BANKS,
    }, { status: 500 });
  }
}

// Fallback bank list in case Paystack API is unavailable
const FALLBACK_BANKS = [
  { id: 1, name: "Access Bank", code: "044", longcode: "044150149", type: "nigerian" },
  { id: 2, name: "Citibank", code: "023", longcode: "023150005", type: "nigerian" },
  { id: 3, name: "Diamond Bank", code: "063", longcode: "063150001", type: "nigerian" },
  { id: 4, name: "EcoBank", code: "050", longcode: "050150010", type: "nigerian" },
  { id: 5, name: "Fidelity Bank", code: "070", longcode: "070150003", type: "nigerian" },
  { id: 6, name: "First Bank of Nigeria", code: "011", longcode: "011151003", type: "nigerian" },
  { id: 7, name: "First City Monument Bank", code: "214", longcode: "214150018", type: "nigerian" },
  { id: 8, name: "Guaranty Trust Bank", code: "058", longcode: "058152036", type: "nigerian" },
  { id: 9, name: "Heritage Bank", code: "030", longcode: "030159954", type: "nigerian" },
  { id: 10, name: "Jaiz Bank", code: "301", longcode: "301080013", type: "nigerian" },
  { id: 11, name: "Keystone Bank", code: "082", longcode: "082150017", type: "nigerian" },
  { id: 12, name: "Kuda Bank", code: "090", longcode: "090115686", type: "nigerian" },
  { id: 13, name: "Opay", code: "100", longcode: "100112928", type: "nigerian" },
  { id: 14, name: "Palmpay", code: "100", longcode: "100112928", type: "nigerian" },
  { id: 15, name: "Polaris Bank", code: "076", longcode: "076151006", type: "nigerian" },
  { id: 16, name: "Providus Bank", code: "101", longcode: "101151017", type: "nigerian" },
  { id: 17, name: "Skye Bank", code: "014", longcode: "014150331", type: "nigerian" },
  { id: 18, name: "Stanbic IBTC Bank", code: "039", longcode: "039150017", type: "nigerian" },
  { id: 19, name: "Sterling Bank", code: "232", longcode: "232150016", type: "nigerian" },
  { id: 20, name: "Suntrust Bank", code: "100", longcode: "100112928", type: "nigerian" },
  { id: 21, name: "TAJ Bank", code: "302", longcode: "302080034", type: "nigerian" },
  { id: 22, name: "Titan Bank", code: "102", longcode: "102150018", type: "nigerian" },
  { id: 23, name: "Union Bank of Nigeria", code: "032", longcode: "032150733", type: "nigerian" },
  { id: 24, name: "United Bank For Africa", code: "033", longcode: "033153734", type: "nigerian" },
  { id: 25, name: "Unity Bank", code: "215", longcode: "215153017", type: "nigerian" },
  { id: 26, name: "Wema Bank", code: "035", longcode: "035150103", type: "nigerian" },
  { id: 27, name: "Zenith Bank", code: "057", longcode: "057150013", type: "nigerian" },
];
