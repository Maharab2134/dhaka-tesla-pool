import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import { prisma } from "../../config/database.js";

describe("Rides & Fare Calculation Integration Tests", () => {
  const app = createApp();

  let nusratToken: string;
  let rafiqToken: string;
  let jashimDriverToken: string;
  let createdRideId: string;

  beforeAll(async () => {
    await prisma.$connect();

    // Login Nusrat
    const nusratLogin = await request(app).post("/api/auth/login").send({
      email: "nusrat@tesla.dhaka",
      password: "Password123!",
    });
    nusratToken = nusratLogin.body.data.token;

    // Login Rafiq
    const rafiqLogin = await request(app).post("/api/auth/login").send({
      email: "rafiq@tesla.dhaka",
      password: "Password123!",
    });
    rafiqToken = rafiqLogin.body.data.token;

    // Login Jashim (Driver)
    const jashimLogin = await request(app).post("/api/auth/login").send({
      email: "jashim@tesla.dhaka",
      password: "Password123!",
    });
    jashimDriverToken = jashimLogin.body.data.token;
  });

  afterAll(async () => {
    // Clean up created ride requests
    if (createdRideId) {
      await prisma.rideStatusHistory.deleteMany({ where: { rideRequestId: createdRideId } });
      await prisma.fare.deleteMany({ where: { rideRequestId: createdRideId } });
      await prisma.rideRequest.deleteMany({ where: { id: createdRideId } });
    }
    await prisma.$disconnect();
  });

  describe("POST /api/rides/estimate", () => {
    it("should return valid fare estimate between Banani and Mohakhali", async () => {
      const response = await request(app)
        .post("/api/rides/estimate")
        .send({
          pickupArea: "Banani",
          destinationArea: "Mohakhali",
          seatsRequested: 1,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.distanceKm).toBeGreaterThan(1);
      expect(response.body.data.pooledFare.finalFarePoisha).toBeLessThan(
        response.body.data.soloFare.finalFarePoisha
      );
      expect(response.body.data.pooledFare.poolDiscountPoisha).toBeGreaterThan(0);
    });

    it("should reject same pickup and destination area", async () => {
      const response = await request(app)
        .post("/api/rides/estimate")
        .send({
          pickupArea: "Banani",
          destinationArea: "Banani",
          seatsRequested: 1,
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should reject invalid area not in Dhaka geography list", async () => {
      const response = await request(app)
        .post("/api/rides/estimate")
        .send({
          pickupArea: "NonExistentArea",
          destinationArea: "Mohakhali",
          seatsRequested: 1,
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/rides", () => {
    it("should allow Passenger Nusrat to create a ride request Banani -> Mohakhali", async () => {
      const response = await request(app)
        .post("/api/rides")
        .set("Authorization", `Bearer ${nusratToken}`)
        .send({
          pickupArea: "Banani",
          destinationArea: "Mohakhali",
          seatsRequested: 1,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      const ride = response.body.data.ride;
      expect(ride.id).toBeDefined();
      createdRideId = ride.id;
      expect(["REQUESTED", "MATCHED"]).toContain(ride.status);
      expect(ride.pickupArea).toBe("Banani");
      expect(ride.destinationArea).toBe("Mohakhali");
      expect(ride.seatsRequested).toBe(1);
      expect(ride.estimatedFarePoisha).toBeGreaterThan(0);
      expect(ride.fare).toBeDefined();
      expect(ride.fare.baseFarePoisha).toBe(6000); // ৳60
    });

    it("should reject ride creation by Driver Jashim (403 Forbidden)", async () => {
      const response = await request(app)
        .post("/api/rides")
        .set("Authorization", `Bearer ${jashimDriverToken}`)
        .send({
          pickupArea: "Banani",
          destinationArea: "Mohakhali",
          seatsRequested: 1,
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("FORBIDDEN");
    });

    it("should reject ride creation without authorization token", async () => {
      const response = await request(app)
        .post("/api/rides")
        .send({
          pickupArea: "Banani",
          destinationArea: "Mohakhali",
          seatsRequested: 1,
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/rides/my-rides", () => {
    it("should return ride history for Nusrat including the newly created ride", async () => {
      const response = await request(app)
        .get("/api/rides/my-rides")
        .set("Authorization", `Bearer ${nusratToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.rides)).toBe(true);
      expect(response.body.data.rides.some((r: any) => r.id === createdRideId)).toBe(true);
    });
  });

  describe("Authorization & Ownership (Passenger A vs Passenger B)", () => {
    it("should allow Nusrat to view her own ride request", async () => {
      const response = await request(app)
        .get(`/api/rides/${createdRideId}`)
        .set("Authorization", `Bearer ${nusratToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.ride.id).toBe(createdRideId);
    });

    it("should forbid Rafiq from viewing Nusrat's private ride request (403)", async () => {
      const response = await request(app)
        .get(`/api/rides/${createdRideId}`)
        .set("Authorization", `Bearer ${rafiqToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("FORBIDDEN");
    });

    it("should allow Driver Jashim to view the ride request", async () => {
      const response = await request(app)
        .get(`/api/rides/${createdRideId}`)
        .set("Authorization", `Bearer ${jashimDriverToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.ride.id).toBe(createdRideId);
    });
  });
});
