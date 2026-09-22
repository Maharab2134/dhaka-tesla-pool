import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "./config/database.js";
import {
  DHAKA_AREAS,
  isValidDhakaArea,
  getDhakaArea,
  calculateDistanceKm,
} from "./config/dhaka-geography.js";

describe("Seed Data & Dhaka Geography Verification", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should have seeded Driver Jashim with vehicle Bullet (capacity 3)", async () => {
    const driver = await prisma.user.findUnique({
      where: { email: "jashim@tesla.dhaka" },
      include: { vehicle: true },
    });

    expect(driver).not.toBeNull();
    expect(driver?.name).toBe("Jashim");
    expect(driver?.role).toBe("DRIVER");
    expect(driver?.vehicle).not.toBeNull();
    expect(driver?.vehicle?.name).toBe("Bullet");
    expect(driver?.vehicle?.capacity).toBe(3);
    expect(driver?.vehicle?.isOnline).toBe(true);
  });

  it("should have seeded Passengers Nusrat, Rafiq, and Shirin", async () => {
    const passengers = await prisma.user.findMany({
      where: {
        email: {
          in: ["nusrat@tesla.dhaka", "rafiq@tesla.dhaka", "shirin@tesla.dhaka"],
        },
      },
    });

    expect(passengers.length).toBe(3);
    const names = passengers.map((p) => p.name).sort();
    expect(names).toEqual(["Nusrat", "Rafiq", "Shirin"]);
    for (const p of passengers) {
      expect(p.role).toBe("PASSENGER");
    }
  });

  it("should correctly validate and calculate distances across Dhaka areas", () => {
    expect(isValidDhakaArea("Banani")).toBe(true);
    expect(isValidDhakaArea("Mohakhali")).toBe(true);
    expect(isValidDhakaArea("Atlantis")).toBe(false);

    const banani = getDhakaArea("Banani");
    const mohakhali = getDhakaArea("Mohakhali");
    const gulshan = getDhakaArea("Gulshan 1");

    expect(banani).toBeDefined();
    expect(mohakhali).toBeDefined();
    expect(gulshan).toBeDefined();

    if (banani && mohakhali && gulshan) {
      const distBananiMohakhali = calculateDistanceKm(banani, mohakhali);
      const distBananiGulshan = calculateDistanceKm(banani, gulshan);

      expect(distBananiMohakhali).toBeGreaterThan(1.0);
      expect(distBananiGulshan).toBeGreaterThan(1.0);
      // Realistic distances in North Dhaka are between 2km and 5km
      expect(distBananiMohakhali).toBeLessThan(10.0);
      expect(distBananiGulshan).toBeLessThan(10.0);
    }
  });
});
