import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import { prisma } from "../../config/database.js";
import { PoolService } from "./pool.service.js";
import { PoolStatus, RideRequestStatus } from "@prisma/client";

describe("Pool Matching, Capacity Enforcement & Concurrency", () => {
  const app = createApp();

  let jashimVehicleId: string;
  let testPoolId: string;
  let nusratId: string;
  let rafiqId: string;
  let shirinId: string;
  let extraPassengerId: string;

  beforeAll(async () => {
    await prisma.$connect();

    // Fetch seeded users
    const jashim = await prisma.user.findUniqueOrThrow({
      where: { email: "jashim@tesla.dhaka" },
      include: { vehicle: true },
    });
    jashimVehicleId = jashim.vehicle!.id;

    const nusrat = await prisma.user.findUniqueOrThrow({ where: { email: "nusrat@tesla.dhaka" } });
    const rafiq = await prisma.user.findUniqueOrThrow({ where: { email: "rafiq@tesla.dhaka" } });
    const shirin = await prisma.user.findUniqueOrThrow({ where: { email: "shirin@tesla.dhaka" } });
    nusratId = nusrat.id;
    rafiqId = rafiq.id;
    shirinId = shirin.id;

    // Create an extra passenger for overbooking testing
    const extraPassenger = await prisma.user.upsert({
      where: { email: "extra.passenger@tesla.dhaka" },
      update: {},
      create: {
        name: "Extra Rider",
        email: "extra.passenger@tesla.dhaka",
        passwordHash: "hash123",
        role: "PASSENGER",
      },
    });
    extraPassengerId = extraPassenger.id;

    // Ensure a clean test pool for Jashim's Bullet vehicle
    const pool = await PoolService.getOrCreateOpenPool(jashimVehicleId);
    testPoolId = pool.id;
  });

  afterAll(async () => {
    // Clean up test pool members, history, fares, ride requests
    await prisma.poolMember.deleteMany({ where: { poolId: testPoolId } });
    await prisma.pool.deleteMany({ where: { id: testPoolId } });
    await prisma.user.deleteMany({ where: { email: "extra.passenger@tesla.dhaka" } });
    await prisma.$disconnect();
  });

  it("should match compatible routes based on pickup and zones", () => {
    // Both starting in Banani
    const isCompatible = PoolService.isRouteCompatible(
      "Banani",
      "Mohakhali",
      "Banani",
      "Gulshan 1"
    );
    expect(isCompatible).toBe(true);

    // Initial empty pool is compatible with any valid route
    expect(PoolService.isRouteCompatible(null, null, "Banani", "Mohakhali")).toBe(true);
  });

  it("should enforce vehicle capacity (Bullet max 3 seats) and transition pool to FULL", async () => {
    // 1. Create ride for Nusrat (1 seat)
    const ride1 = await prisma.rideRequest.create({
      data: {
        passengerId: nusratId,
        pickupArea: "Banani",
        destinationArea: "Mohakhali",
        seatsRequested: 1,
        status: RideRequestStatus.REQUESTED,
        estimatedFarePoisha: 10500,
      },
    });

    const assign1 = await PoolService.assignRideToPool(ride1.id, testPoolId);
    expect(assign1.occupiedSeats).toBe(1);
    expect(assign1.isFull).toBe(false);

    // 2. Create ride for Rafiq (1 seat)
    const ride2 = await prisma.rideRequest.create({
      data: {
        passengerId: rafiqId,
        pickupArea: "Banani",
        destinationArea: "Gulshan 1",
        seatsRequested: 1,
        status: RideRequestStatus.REQUESTED,
        estimatedFarePoisha: 10500,
      },
    });

    const assign2 = await PoolService.assignRideToPool(ride2.id, testPoolId);
    expect(assign2.occupiedSeats).toBe(2);
    expect(assign2.isFull).toBe(false);

    // 3. Create ride for Shirin (1 seat) -> Should reach 3/3 capacity and become FULL
    const ride3 = await prisma.rideRequest.create({
      data: {
        passengerId: shirinId,
        pickupArea: "Banani",
        destinationArea: "Gulshan 1",
        seatsRequested: 1,
        status: RideRequestStatus.REQUESTED,
        estimatedFarePoisha: 10500,
      },
    });

    const assign3 = await PoolService.assignRideToPool(ride3.id, testPoolId);
    expect(assign3.occupiedSeats).toBe(3);
    expect(assign3.isFull).toBe(true);

    // Verify pool status in database
    const poolInDb = await prisma.pool.findUniqueOrThrow({ where: { id: testPoolId } });
    expect(poolInDb.status).toBe(PoolStatus.FULL);

    // 4. Overbooking prevention: 4th passenger attempts to claim a seat in the full pool
    const ride4 = await prisma.rideRequest.create({
      data: {
        passengerId: extraPassengerId,
        pickupArea: "Banani",
        destinationArea: "Gulshan 1",
        seatsRequested: 1,
        status: RideRequestStatus.REQUESTED,
        estimatedFarePoisha: 10500,
      },
    });

    await expect(PoolService.assignRideToPool(ride4.id, testPoolId)).rejects.toThrow(
      /Vehicle capacity exceeded/
    );

    // Ensure database still has exactly 3 members
    const memberCount = await prisma.poolMember.count({ where: { poolId: testPoolId } });
    expect(memberCount).toBe(3);
  });

  it("should safely handle concurrent booking for the last available seat", async () => {
    // Create a fresh dedicated test pool with capacity 2
    const concurrentPool = await prisma.pool.create({
      data: {
        vehicleId: jashimVehicleId,
        status: PoolStatus.OPEN,
      },
    });

    // Seed 1 member so exactly 1 seat remains (Bullet has capacity 3, but let's seat 2 riders first)
    const fillerRide1 = await prisma.rideRequest.create({
      data: {
        passengerId: nusratId,
        pickupArea: "Banani",
        destinationArea: "Mohakhali",
        seatsRequested: 1,
        status: RideRequestStatus.REQUESTED,
        estimatedFarePoisha: 10000,
      },
    });
    const fillerRide2 = await prisma.rideRequest.create({
      data: {
        passengerId: rafiqId,
        pickupArea: "Banani",
        destinationArea: "Gulshan 1",
        seatsRequested: 1,
        status: RideRequestStatus.REQUESTED,
        estimatedFarePoisha: 10000,
      },
    });

    await PoolService.assignRideToPool(fillerRide1.id, concurrentPool.id);
    await PoolService.assignRideToPool(fillerRide2.id, concurrentPool.id);

    // Current occupancy: 2 / 3. Exactly 1 seat remains!
    // Now two passengers (Shirin and Extra Rider) both try to claim the final seat simultaneously.
    const candidateRideA = await prisma.rideRequest.create({
      data: {
        passengerId: shirinId,
        pickupArea: "Banani",
        destinationArea: "Mohakhali",
        seatsRequested: 1,
        status: RideRequestStatus.REQUESTED,
        estimatedFarePoisha: 10000,
      },
    });

    const candidateRideB = await prisma.rideRequest.create({
      data: {
        passengerId: extraPassengerId,
        pickupArea: "Banani",
        destinationArea: "Mohakhali",
        seatsRequested: 1,
        status: RideRequestStatus.REQUESTED,
        estimatedFarePoisha: 10000,
      },
    });

    // Fire both seat assignment requests concurrently
    const results = await Promise.allSettled([
      PoolService.assignRideToPool(candidateRideA.id, concurrentPool.id),
      PoolService.assignRideToPool(candidateRideB.id, concurrentPool.id),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    // Exactly one must succeed, and one must be rejected due to capacity limit
    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);

    // Verify final occupied seats is exactly 3 (capacity), never 4
    const totalMembers = await prisma.poolMember.count({
      where: { poolId: concurrentPool.id },
    });
    expect(totalMembers).toBe(3);

    // Clean up concurrent pool
    await prisma.poolMember.deleteMany({ where: { poolId: concurrentPool.id } });
    await prisma.pool.deleteMany({ where: { id: concurrentPool.id } });
  });

  it("GET /api/pools/active should list active pools with seat meters", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "jashim@tesla.dhaka", password: "Password123!" });
    const token = loginRes.body.data.token;

    const response = await request(app)
      .get("/api/pools/active")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data.pools)).toBe(true);
    if (response.body.data.pools.length > 0) {
      const pool = response.body.data.pools[0];
      expect(pool.occupiedSeats).toBeDefined();
      expect(pool.availableSeats).toBeDefined();
    }
  });
});
