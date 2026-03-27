#!/usr/bin/env tsx

/**
 * Bus Stop Data Crawler
 * 
 * This script combines:
 * 1. Curated static bus stop data from /lib/lgas.ts (primary source)
 * 2. Real-time OpenStreetMap data (supplementary)
 * 
 * Outputs: data/bus-stops.json
 * 
 * Run: pnpm tsx scripts/crawl-bus-stops.ts
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { LAGOS_LGAS, type LGA, type BusStop } from '../src/lib/lgas';

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

interface OSMBusStop {
  name: string;
  landmarks: string[];
  lat: number;
  lng: number;
}

interface OSMElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

async function fetchOSMBusStops(): Promise<OSMBusStop[]> {
  const query = `
    [out:json][timeout:90];
    
    // Lagos bounding box
    (
      node["highway"="bus_stop"](6.35,2.95,6.75,3.90);
      node["public_transport"="stop_position"]["name"](6.35,2.95,6.75,3.90);
      node["amenity"="bus_station"]["name"](6.35,2.95,6.75,3.90);
      node["railway"="station"]["name"](6.35,2.95,6.75,3.90);
      node["amenity"="taxi"]["name"](6.35,2.95,6.75,3.90);
    );
    out body;
  `;

  try {
    const response = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      console.error(`OSM API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const elements: OSMElement[] = data.elements || [];

    const busStops: OSMBusStop[] = [];
    const seen = new Set<string>();

    elements.forEach((el: OSMElement) => {
      const lat = el.lat || el.center?.lat;
      const lng = el.lon || el.center?.lon;
      
      if (!lat || !lng) return;
      
      const name = el.tags?.name || el.tags?.ref;
      if (!name || seen.has(name.toLowerCase())) return;
      seen.add(name.toLowerCase());

      const landmarks: string[] = [];
      if (el.tags?.shop) landmarks.push(el.tags.shop);
      if (el.tags?.amenity && el.tags.amenity !== "bus_station" && el.tags.amenity !== "taxi") {
        landmarks.push(el.tags.amenity);
      }
      if (el.tags?.building) landmarks.push(el.tags.building);
      if (el.tags?.["name:en"]) landmarks.push(el.tags["name:en"]);

      busStops.push({
        name,
        landmarks: [...new Set(landmarks)].slice(0, 3),
        lat,
        lng,
      });
    });

    return busStops;
  } catch (error) {
    console.error("Error fetching OSM data:", error);
    return [];
  }
}

function mergeBusStops(staticBusStops: BusStop[], osmBusStops: OSMBusStop[]): OSMBusStop[] {
  const merged = new Map<string, OSMBusStop>();

  // Add static bus stops first (priority)
  staticBusStops.forEach(bs => {
    merged.set(bs.name.toLowerCase(), {
      name: bs.name,
      landmarks: bs.landmarks,
      lat: 0, // Static data doesn't have coordinates
      lng: 0,
    });
  });

  // Add OSM bus stops (only if not already in static data)
  osmBusStops.forEach(bs => {
    const key = bs.name.toLowerCase();
    if (!merged.has(key)) {
      merged.set(key, bs);
    } else {
      // Update coordinates if we have them from OSM
      const existing = merged.get(key)!;
      if (existing.lat === 0 && existing.lng === 0) {
        merged.set(key, { ...existing, lat: bs.lat, lng: bs.lng });
      }
    }
  });

  return Array.from(merged.values());
}

function assignBusStopToLGA(busStop: OSMBusStop | BusStop, lgaList: typeof LAGOS_LGAS): string | null {
  const stopName = busStop.name.toUpperCase();
  const landmarks = busStop.landmarks.map(l => l.toUpperCase()).join(" ");
  const searchText = `${stopName} ${landmarks}`;

  const lgaKeywords: Record<string, string[]> = {
    "Agege": ["AGEGE", "PEN CINEMA", "ORILE AGEGE", "DOPEMU"],
    "Ajeromi-Ifelodun": ["AJEGUNLE", "ALABA", "OLODI"],
    "Alimosho": ["IKOTUN", "EGBE", "IDIMU", "IPAJA", "AYOBO"],
    "Amuwo-Odofin": ["FESTAC", "AMUWO", "SATELLITE"],
    "Apapa": ["APAPA", "LIVERPOOL", "IJORA"],
    "Badagry": ["BADAGRY", "SEME", "TOPO"],
    "Epe": ["EPE"],
    "Eti-Osa": ["VICTORIA ISLAND", "VI", "LEKKI", "AJAH", "IKOYI", "VGC", "IKOTA"],
    "Ibeju-Lekki": ["IBEJU", "ELEKO", "AKODO"],
    "Ifako-Ijaiye": ["OGBA", "IJAIYE"],
    "Ikeja": ["IKEJA", "ALLEN", "MARYLAND", "OREGUN"],
    "Ikorodu": ["IKORODU", "BABCOCK", "OWODE", "IJEDE"],
    "Kosofe": ["KETU", "MILE 12", "OJOTA", "OGUDU"],
    "Lagos Island": ["CMS", "IDUMOTA", "ONIKAN", "TINUBU"],
    "Surulere": ["SURULERE", "TEJUOSHO", "OJUELEGBA", "AGUDA", "ADELABU", "SHITTA", "ITIRE"],
    "Lagos Mainland": ["OYINGBO", "EBUTE METTA", "YABA"],
    "Mushin": ["MUSHIN", "AJAO ESTATE"],
    "Ojo": ["OJO", "IJANIKIN", "AJANGBADI"],
    "Oshodi-Isolo": ["OSHODI", "MAFOLUKU", "OKOTA"],
    "Shomolu": ["SHOMOLU", "BARIGA", "FADEYI", "PEDRO"],
  };

  // Check for exact LGA name match first
  for (const lga of lgaList) {
    if (searchText.includes(lga.name.toUpperCase())) {
      return lga.name;
    }
  }

  // Check keywords (order matters - check Surulere before Lagos Mainland)
  const orderedLGAs = [
    "Surulere", "Agege", "Ajeromi-Ifelodun", "Alimosho", "Amuwo-Odofin",
    "Apapa", "Badagry", "Epe", "Eti-Osa", "Ibeju-Lekki", "Ifako-Ijaiye",
    "Ikeja", "Ikorodu", "Kosofe", "Lagos Island", "Lagos Mainland",
    "Mushin", "Ojo", "Oshodi-Isolo", "Shomolu"
  ];

  for (const lgaName of orderedLGAs) {
    const keywords = lgaKeywords[lgaName] || [];
    if (keywords.some(kw => searchText.includes(kw))) {
      return lgaName;
    }
  }

  return null;
}

async function main() {
  console.log("🚀 Starting bus stop crawler...\n");

  // Official 20 Lagos LGAs
  const OFFICIAL_LGAS = [
    "Agege", "Ajeromi-Ifelodun", "Alimosho", "Amuwo-Odofin", "Apapa",
    "Badagry", "Epe", "Eti-Osa", "Ibeju-Lekki", "Ifako-Ijaiye",
    "Ikeja", "Ikorodu", "Kosofe", "Lagos Island", "Lagos Mainland",
    "Mushin", "Ojo", "Oshodi-Isolo", "Shomolu", "Surulere"
  ];

  // Step 1: Fetch OSM data
  console.log("📡 Fetching data from OpenStreetMap...");
  const osmBusStops = await fetchOSMBusStops();
  console.log(`✅ Found ${osmBusStops.length} bus stops from OSM\n`);

  // Step 2: Merge with static data
  console.log("🔄 Merging with curated static data...");
  const lgaData: Record<string, OSMBusStop[]> = {};
  
  // Initialize all official LGAs
  OFFICIAL_LGAS.forEach(lga => {
    lgaData[lga] = [];
  });

  // Map static LGA names to official names
  const lgaNameMapping: Record<string, string> = {
    "Apapa-Ijashe": "Apapa",
    "Oshodi/Isolo": "Oshodi-Isolo",
    "Yaba": "Lagos Mainland", // Yaba is part of Lagos Mainland
  };

  // Add static bus stops (these are curated and high quality)
  LAGOS_LGAS.forEach(lga => {
    const officialName = lgaNameMapping[lga.name] || lga.name;
    
    // Skip if not in official 20 LGAs
    if (!OFFICIAL_LGAS.includes(officialName)) {
      console.log(`⚠️  Skipping ${lga.name} (mapped to ${officialName}) - not in official LGA list`);
      return;
    }

    lga.busStops.forEach(bs => {
      lgaData[officialName].push({
        name: bs.name,
        landmarks: bs.landmarks,
        lat: 0,
        lng: 0,
      });
    });
  });

  // Add OSM bus stops if they don't exist
  const staticStopNames = new Set(
    LAGOS_LGAS.flatMap(lga => lga.busStops.map(bs => bs.name.toLowerCase()))
  );

  osmBusStops.forEach(osm => {
    if (!staticStopNames.has(osm.name.toLowerCase())) {
      const assignedLGA = assignBusStopToLGA(osm, LAGOS_LGAS);
      const officialName = assignedLGA ? (lgaNameMapping[assignedLGA] || assignedLGA) : null;
      
      if (officialName && OFFICIAL_LGAS.includes(officialName) && lgaData[officialName]) {
        lgaData[officialName].push(osm);
      }
    }
  });

  // Step 3: Build final output
  const output = {
    lastUpdated: new Date().toISOString(),
    source: "hybrid (curated + OpenStreetMap)",
    totalLGAs: OFFICIAL_LGAS.length,
    totalBusStops: Object.values(lgaData).reduce((sum, stops) => sum + stops.length, 0),
    lgas: OFFICIAL_LGAS.map(name => ({
      name,
      description: `${name} Local Government Area`,
      busStops: (lgaData[name] || []).map(bs => ({
        name: bs.name,
        landmarks: bs.landmarks,
        ...(bs.lat !== 0 && bs.lng !== 0 ? { lat: bs.lat, lng: bs.lng } : {}),
      })),
    })).sort((a, b) => b.busStops.length - a.busStops.length),
  };

  console.log(`✅ Merged successfully\n`);
  console.log("📊 Statistics:");
  console.log(`   - Total LGAs: ${output.totalLGAs}`);
  console.log(`   - Total bus stops: ${output.totalBusStops}`);
  console.log(`   - LGAs with data: ${output.lgas.filter(l => l.busStops.length > 0).length}/20\n`);
  
  // Show LGAs with no data
  const emptyLGAs = output.lgas.filter(l => l.busStops.length === 0);
  if (emptyLGAs.length > 0) {
    console.log("⚠️  LGAs with no bus stop data:");
    emptyLGAs.forEach(lga => console.log(`   - ${lga.name}`));
    console.log();
  }

  // Step 4: Write to file
  const dataDir = join(process.cwd(), 'data');
  mkdirSync(dataDir, { recursive: true });
  
  const outputPath = join(dataDir, 'bus-stops.json');
  writeFileSync(outputPath, JSON.stringify(output, null, 2));
  
  console.log(`✅ Saved to ${outputPath}`);
  console.log("\n🎉 Crawler completed successfully!");
}

main().catch(error => {
  console.error("❌ Crawler failed:", error);
  process.exit(1);
});
