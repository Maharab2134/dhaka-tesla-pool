import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import { prisma } from "../../config/database.js";
import { UserRole } from "@prisma/client";

describe("Authentication Module", () => {
  const app = createApp();

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    // Clean up test users created during test run
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ["test.passenger@example.com", "test.driver@example.com"],
        },
      },
    });
    await prisma.$disconnect();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new passenger successfully", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test Passenger",
          email: "test.passenger@example.com",
          password: "SecurePassword123!",
          role: UserRole.PASSENGER,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe("test.passenger@example.com");
      expect(response.body.data.user.role).toBe("PASSENGER");
      expect(response.body.data.token).toBeDefined();
    });

    it("should register a new driver and create a vehicle", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test Driver",
          email: "test.driver@example.com",
          password: "SecurePassword123!",
          role: UserRole.DRIVER,
          vehicleName: "Thunderbolt",
          vehicleCapacity: 3,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe("DRIVER");
      expect(response.body.data.user.vehicle).toBeDefined();
      expect(response.body.data.user.vehicle.name).toBe("Thunderbolt");
      expect(response.body.data.user.vehicle.capacity).toBe(3);
    });

    it("should reject registration with duplicate email", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Duplicate Passenger",
          email: "test.passenger@example.com",
          password: "AnotherPassword123!",
          role: UserRole.PASSENGER,
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("EMAIL_EXISTS");
    });

    it("should reject invalid registration data with 422", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "X",
          email: "not-an-email",
          password: "123",
          role: "ADMIN",
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
      expect(response.body.error.details.length).toBeGreaterThan(0);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login seeded Driver Jashim with valid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "jashim@tesla.dhaka",
          password: "Password123!",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.name).toBe("Jashim");
      expect(response.body.data.user.role).toBe("DRIVER");
      expect(response.body.data.user.vehicle.name).toBe("Bullet");
      expect(response.body.data.token).toBeDefined();
    });

    it("should login seeded Passenger Nusrat with valid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nusrat@tesla.dhaka",
          password: "Password123!",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.name).toBe("Nusrat");
      expect(response.body.data.user.role).toBe("PASSENGER");
      expect(response.body.data.token).toBeDefined();
    });

    it("should reject login with wrong password", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nusrat@tesla.dhaka",
          password: "WrongPassword!",
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("INVALID_CREDENTIALS");
    });

    it("should reject login with non-existent email", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "ghost@tesla.dhaka",
          password: "Password123!",
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("INVALID_CREDENTIALS");
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return profile when authenticated with valid token", async () => {
      // 1. Login as Nusrat to obtain token
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nusrat@tesla.dhaka",
          password: "Password123!",
        });

      const token = loginRes.body.data.token;

      // 2. Fetch profile
      const meRes = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(meRes.status).toBe(200);
      expect(meRes.body.success).toBe(true);
      expect(meRes.body.data.user.name).toBe("Nusrat");
      expect(meRes.body.data.user.email).toBe("nusrat@tesla.dhaka");
      expect(meRes.body.data.user.role).toBe("PASSENGER");
    });

    it("should reject request with missing token", async () => {
      const response = await request(app).get("/api/auth/me");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("UNAUTHORIZED");
    });

    it("should reject request with forged/invalid token", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid-tampered-token");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("UNAUTHORIZED");
    });
  });
});
