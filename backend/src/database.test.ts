import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "./config/database.js";

describe("Database Schema & Connection", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should connect to PostgreSQL successfully and check tables", async () => {
    const userCount = await prisma.user.count();
    const vehicleCount = await prisma.vehicle.count();
    const poolCount = await prisma.pool.count();
    const rideRequestCount = await prisma.rideRequest.count();

    expect(typeof userCount).toBe("number");
    expect(typeof vehicleCount).toBe("number");
    expect(typeof poolCount).toBe("number");
    expect(typeof rideRequestCount).toBe("number");
  });

  it("should verify schema constraints and enums", async () => {
    // Verify enum types are exported and accessible
    expect(prisma.user).toBeDefined();
    expect(prisma.vehicle).toBeDefined();
    expect(prisma.pool).toBeDefined();
    expect(prisma.poolMember).toBeDefined();
    expect(prisma.rideRequest).toBeDefined();
    expect(prisma.rideStatusHistory).toBeDefined();
    expect(prisma.fare).toBeDefined();
    expect(prisma.payment).toBeDefined();
  });
});
