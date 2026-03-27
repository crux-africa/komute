
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const CORRIDORS = [
  { from: { lat: 6.6194, lng: 3.5105, area: "Ikorodu", addr: "Ikorodu Garage" }, to: { lat: 6.4281, lng: 3.4219, area: "Victoria Island", addr: "Adeola Odeku St, VI" } },
  { from: { lat: 6.4698, lng: 3.5852, area: "Ajah", addr: "Ajah Under Bridge" }, to: { lat: 6.4281, lng: 3.4219, area: "Victoria Island", addr: "Sanusi Fafunwa, VI" } },
  { from: { lat: 6.8100, lng: 3.4400, area: "Mowe", addr: "Mowe Junction" }, to: { lat: 6.5955, lng: 3.3421, area: "Ikeja", addr: "Allen Avenue, Ikeja" } },
  { from: { lat: 6.4478, lng: 3.4723, area: "Lekki Phase 1", addr: "Lekki Phase 1 Roundabout" }, to: { lat: 6.5955, lng: 3.3421, area: "Ikeja GRA", addr: "Ikeja GRA" } },
  { from: { lat: 6.6018, lng: 3.3515, area: "Berger", addr: "Berger Bus Stop" }, to: { lat: 6.4488, lng: 3.3597, area: "Apapa", addr: "Wharf Road, Apapa" } },
];

async function seed() {
  console.log("Seeding database...");

  // Create demo drivers
  const drivers = await Promise.all([
    prisma.user.upsert({
      where: { phone: "08011111111" },
      update: {},
      create: { phone: "08011111111", name: "Adeola Johnson", firstName: "Adeola", lastName: "Johnson", roles: ["DRIVER", "RIDER"], isOnboarded: true, ninVerified: true, rating: 4.7, ratingCount: 23 },
    }),
    prisma.user.upsert({
      where: { phone: "08022222222" },
      update: {},
      create: { phone: "08022222222", name: "Chukwuma Obi", firstName: "Chukwuma", lastName: "Obi", roles: ["DRIVER", "RIDER"], isOnboarded: true, ninVerified: true, rating: 4.5, ratingCount: 15 },
    }),
    prisma.user.upsert({
      where: { phone: "08033333333" },
      update: {},
      create: { phone: "08033333333", name: "Fatima Bello", firstName: "Fatima", lastName: "Bello", roles: ["DRIVER", "RIDER"], isOnboarded: true, ninVerified: true, rating: 4.9, ratingCount: 41 },
    }),
    prisma.user.upsert({
      where: { phone: "08044444444" },
      update: {},
      create: { phone: "08044444444", name: "Musa Abubakar", firstName: "Musa", lastName: "Abubakar", roles: ["DRIVER"], isOnboarded: true, ninVerified: true, rating: 4.3, ratingCount: 8 },
    }),
    prisma.user.upsert({
      where: { phone: "08055555555" },
      update: {},
      create: { phone: "08055555555", name: "Blessing Eze", firstName: "Blessing", lastName: "Eze", roles: ["DRIVER", "RIDER"], isOnboarded: true, ninVerified: true, rating: 4.6, ratingCount: 19 },
    }),
  ]);

  // Create driver profiles
  const vehicles = [
    { type: "CAR" as const, make: "Toyota", model: "Camry", color: "Silver", year: 2019, seats: 3, plate: "LAG 234 AJ" },
    { type: "CAR" as const, make: "Honda", model: "Accord", color: "Black", year: 2020, seats: 3, plate: "LAG 567 CO" },
    { type: "SHUTTLE" as const, make: "Toyota", model: "HiAce", color: "White", year: 2018, seats: 10, plate: "LAG 891 FB" },
    { type: "KEKE" as const, make: "Bajaj", model: "RE", color: "Yellow", year: 2022, seats: 2, plate: "KK 123 MA" },
    { type: "CAR" as const, make: "Toyota", model: "Corolla", color: "Blue", year: 2021, seats: 3, plate: "LAG 456 BE" },
  ];

  for (let i = 0; i < drivers.length; i++) {
    await prisma.driverProfile.upsert({
      where: { userId: drivers[i].id },
      update: {},
      create: {
        userId: drivers[i].id,
        vehicleType: vehicles[i].type,
        vehicleMake: vehicles[i].make,
        vehicleModel: vehicles[i].model,
        vehicleColor: vehicles[i].color,
        vehicleYear: vehicles[i].year,
        maxSeats: vehicles[i].seats,
        plateNumber: vehicles[i].plate,
        licenseVerified: true,
        faceVerified: i < 3,
        isApproved: true,
        approvedAt: new Date(),
      },
    });
  }

  // Create rides for tomorrow morning
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const rideConfigs = [
    { driverIdx: 0, corridorIdx: 0, hour: 6, min: 0, price: 80000, seats: 3 },
    { driverIdx: 1, corridorIdx: 0, hour: 6, min: 30, price: 90000, seats: 3 },
    { driverIdx: 2, corridorIdx: 1, hour: 5, min: 45, price: 50000, seats: 8 },
    { driverIdx: 3, corridorIdx: 2, hour: 6, min: 15, price: 40000, seats: 2 },
    { driverIdx: 4, corridorIdx: 3, hour: 7, min: 0, price: 100000, seats: 3 },
    { driverIdx: 0, corridorIdx: 4, hour: 6, min: 45, price: 70000, seats: 3 },
    { driverIdx: 2, corridorIdx: 0, hour: 7, min: 15, price: 45000, seats: 6 },
    { driverIdx: 1, corridorIdx: 1, hour: 6, min: 0, price: 85000, seats: 3 },
  ];

  for (const rc of rideConfigs) {
    const dep = new Date(tomorrow);
    dep.setHours(rc.hour, rc.min, 0, 0);
    const corridor = CORRIDORS[rc.corridorIdx];

    await prisma.ride.create({
      data: {
        driverId: drivers[rc.driverIdx].id,
        originLat: corridor.from.lat,
        originLng: corridor.from.lng,
        originAddress: corridor.from.addr,
        originArea: corridor.from.area,
        destLat: corridor.to.lat,
        destLng: corridor.to.lng,
        destAddress: corridor.to.addr,
        destArea: corridor.to.area,
        departureTime: dep,
        availableSeats: rc.seats,
        totalSeats: rc.seats,
        pricePerSeat: rc.price,
        vehicleType: vehicles[rc.driverIdx].type,
        isRecurring: true,
        recurringDays: "MON,TUE,WED,THU,FRI",
      },
    });
  }

  console.log(`Seeded ${drivers.length} drivers and ${rideConfigs.length} rides`);
  await prisma.$disconnect();
  await pool.end();
}

seed().catch(console.error);