import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import { prisma } from "../../config/database.js";
import { RideRequestStatus, PaymentStatus } from "@prisma/client";

describe("Ride Lifecycle & Driver Flow Integration Tests", () => {
  const app = createApp();

  let jashimToken: string;
  let nusratToken: string;
  let nusratId: string;
  let testRideId: string;

  beforeAll(async () => {
    await prisma.$connect();

    // Login Jashim (Driver)
    const jashimLogin = await request(app).post("/api/auth/login").send({
      email: "jashim@tesla.dhaka",
      password: "Password123!",
    });
    jashimToken = jashimLogin.body.data.token;

    // Login Nusrat (Passenger)
    const nusratLogin = await request(app).post("/api/auth/login").send({
      email: "nusrat@tesla.dhaka",
      password: "Password123!",
    });
    nusratToken = nusratLogin.body.data.token;
    nusratId = nusratLogin.body.data.user.id;

    // Clean up any existing rides for Nusrat before starting
    const existingRides = await prisma.rideRequest.findMany({
      where: { passengerId: nusratId },
      select: { id: true },
    });
    const rideIds = existingRides.map((r) => r.id);
    if (rideIds.length > 0) {
      await prisma.payment.deleteMany({ where: { rideRequestId: { in: rideIds } } });
      await prisma.rideStatusHistory.deleteMany({ where: { rideRequestId: { in: rideIds } } });
      await prisma.poolMember.deleteMany({ where: { rideRequestId: { in: rideIds } } });
      await prisma.fare.deleteMany({ where: { rideRequestId: { in: rideIds } } });
      await prisma.rideRequest.deleteMany({ where: { id: { in: rideIds } } });
    }
  });

  afterAll(async () => {
    // Clean up created test ride
    if (testRideId) {
      await prisma.payment.deleteMany({ where: { rideRequestId: testRideId } });
      await prisma.rideStatusHistory.deleteMany({ where: { rideRequestId: testRideId } });
      await prisma.poolMember.deleteMany({ where: { rideRequestId: testRideId } });
      await prisma.fare.deleteMany({ where: { rideRequestId: testRideId } });
      await prisma.rideRequest.deleteMany({ where: { id: testRideId } });
    }
    await prisma.$disconnect();
  });

  it("should allow driver to toggle online/offline status", async () => {
    // Set offline
    const resOffline = await request(app)
      .patch("/api/driver/online")
      .set("Authorization", `Bearer ${jashimToken}`)
      .send({ isOnline: false });

    expect(resOffline.status).toBe(200);
    expect(resOffline.body.data.vehicle.isOnline).toBe(false);

    // Set back online
    const resOnline = await request(app)
      .patch("/api/driver/online")
      .set("Authorization", `Bearer ${jashimToken}`)
      .send({ isOnline: true });

    expect(resOnline.status).toBe(200);
    expect(resOnline.body.data.vehicle.isOnline).toBe(true);
  });

  it("should allow driver to fetch vehicle details", async () => {
    const res = await request(app)
      .get("/api/driver/vehicle")
      .set("Authorization", `Bearer ${jashimToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.vehicle.name).toBe("Bullet");
    expect(res.body.data.vehicle.capacity).toBe(3);
  });

  describe("Lifecycle state machine execution: REQUESTED -> MATCHED -> ARRIVED -> STARTED -> COMPLETED", () => {
    it("Step 1: Nusrat requests ride and Driver Jashim accepts it into pool", async () => {
      const createRes = await request(app)
        .post("/api/rides")
        .set("Authorization", `Bearer ${nusratToken}`)
        .send({
          pickupArea: "Banani",
          destinationArea: "Mohakhali",
          seatsRequested: 1,
        });

      expect(createRes.status).toBe(201);
      testRideId = createRes.body.data.ride.id;

      // If not already auto-matched, driver accepts it
      if (createRes.body.data.ride.status === "REQUESTED") {
        const acceptRes = await request(app)
          .post(`/api/driver/rides/${testRideId}/accept`)
          .set("Authorization", `Bearer ${jashimToken}`);
        expect(acceptRes.status).toBe(200);
      }

      const rideCheck = await prisma.rideRequest.findUniqueOrThrow({
        where: { id: testRideId },
      });
      expect(rideCheck.status).toBe("MATCHED");
    });

    it("Step 2: Driver marks DRIVER_ARRIVED", async () => {
      const arriveRes = await request(app)
        .post(`/api/driver/rides/${testRideId}/arrive`)
        .set("Authorization", `Bearer ${jashimToken}`);

      expect(arriveRes.status).toBe(200);
      expect(arriveRes.body.data.ride.status).toBe("DRIVER_ARRIVED");
    });

    it("Step 3: Driver marks STARTED", async () => {
      const startRes = await request(app)
        .post(`/api/driver/rides/${testRideId}/start`)
        .set("Authorization", `Bearer ${jashimToken}`);

      expect(startRes.status).toBe(200);
      expect(startRes.body.data.ride.status).toBe("STARTED");
    });

    it("Step 4: Driver marks COMPLETED and generates payment", async () => {
      const completeRes = await request(app)
        .post(`/api/driver/rides/${testRideId}/complete`)
        .set("Authorization", `Bearer ${jashimToken}`)
        .send({ paymentMethod: "TESLA_PAY" });

      expect(completeRes.status).toBe(200);
      expect(completeRes.body.data.ride.status).toBe("COMPLETED");

      // Verify payment was recorded
      const payment = await prisma.payment.findFirst({
        where: { rideRequestId: testRideId },
      });
      expect(payment).not.toBeNull();
      expect(payment?.status).toBe(PaymentStatus.PAID);
      expect(payment?.method).toBe("TESLA_PAY");
      expect(payment?.amountPoisha).toBeGreaterThan(0);
    });

    it("Step 5: Should reject illegal transition COMPLETED -> STARTED", async () => {
      const invalidRes = await request(app)
        .post(`/api/driver/rides/${testRideId}/start`)
        .set("Authorization", `Bearer ${jashimToken}`);

      expect(invalidRes.status).toBe(400);
      expect(invalidRes.body.success).toBe(false);
      expect(invalidRes.body.error.code).toBe("INVALID_STATE_TRANSITION");
    });

    it("Step 6: Should reject cancellation of already COMPLETED ride", async () => {
      const cancelRes = await request(app)
        .post(`/api/rides/${testRideId}/cancel`)
        .set("Authorization", `Bearer ${nusratToken}`);

      expect(cancelRes.status).toBe(400);
      expect(cancelRes.body.success).toBe(false);
      expect(cancelRes.body.error.code).toBe("INVALID_STATE_TRANSITION");
    });
  });

  describe("Ride Cancellation by Passenger", () => {
    it("should allow passenger to cancel a REQUESTED ride and audit history", async () => {
      // 1. Create a new ride
      const createRes = await request(app)
        .post("/api/rides")
        .set("Authorization", `Bearer ${nusratToken}`)
        .send({
          pickupArea: "Farmgate",
          destinationArea: "Dhanmondi",
          seatsRequested: 1,
        });

      const cancelRideId = createRes.body.data.ride.id;

      // 2. Cancel the ride
      const cancelRes = await request(app)
        .post(`/api/rides/${cancelRideId}/cancel`)
        .set("Authorization", `Bearer ${nusratToken}`);

      expect(cancelRes.status).toBe(200);
      expect(cancelRes.body.data.ride.status).toBe("CANCELLED");

      // Verify audit history contains transition to CANCELLED
      const history = await prisma.rideStatusHistory.findMany({
        where: { rideRequestId: cancelRideId },
        orderBy: { createdAt: "desc" },
      });
      expect(history[0].toStatus).toBe(RideRequestStatus.CANCELLED);

      // Clean up
      await prisma.rideStatusHistory.deleteMany({ where: { rideRequestId: cancelRideId } });
      await prisma.fare.deleteMany({ where: { rideRequestId: cancelRideId } });
      await prisma.rideRequest.deleteMany({ where: { id: cancelRideId } });
    });
  });
});
