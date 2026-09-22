import { PaymentMethod, PoolStatus, RideRequestStatus } from "@prisma/client";
import { prisma } from "../../config/database.js";
import { AppError } from "../../middleware/errorHandler.js";
import { RideLifecycle } from "../rides/ride-lifecycle.js";
import { PoolService } from "../pools/pool.service.js";

export class DriverService {
  /**
   * Retrieves driver's assigned vehicle.
   */
  static async getDriverVehicle(driverId: string) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { driverId },
    });

    if (!vehicle) {
      throw new AppError("No vehicle registered for this driver", 404, "VEHICLE_NOT_FOUND");
    }

    return vehicle;
  }

  /**
   * Toggles driver's online status.
   */
  static async setOnlineStatus(driverId: string, isOnline: boolean) {
    const vehicle = await this.getDriverVehicle(driverId);

    const updated = await prisma.vehicle.update({
      where: { id: vehicle.id },
      data: { isOnline },
    });

    return updated;
  }

  /**
   * Retrieves the driver's active pool, occupied seats, and passenger details.
   */
  static async getCurrentPool(driverId: string) {
    const vehicle = await this.getDriverVehicle(driverId);

    const pool = await prisma.pool.findFirst({
      where: {
        vehicleId: vehicle.id,
        status: { in: [PoolStatus.OPEN, PoolStatus.ACTIVE, PoolStatus.FULL] },
      },
      include: {
        vehicle: true,
        members: {
          include: {
            passenger: { select: { id: true, name: true, email: true } },
            rideRequest: {
              include: { fare: true, statusHistory: { orderBy: { createdAt: "asc" } } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!pool) {
      return null;
    }

    const occupiedSeats = pool.members.reduce((acc, m) => acc + m.seats, 0);

    return {
      ...pool,
      occupiedSeats,
      availableSeats: Math.max(0, vehicle.capacity - occupiedSeats),
    };
  }

  /**
   * Lists unassigned pending requests in Dhaka that fit in driver's vehicle.
   */
  static async getAvailableRequests(driverId: string) {
    const vehicle = await this.getDriverVehicle(driverId);
    if (!vehicle.isOnline) {
      return [];
    }

    const currentPool = await this.getCurrentPool(driverId);
    const availableSeats = currentPool
      ? currentPool.availableSeats
      : vehicle.capacity;

    if (availableSeats <= 0) {
      return [];
    }

    return prisma.rideRequest.findMany({
      where: {
        status: RideRequestStatus.REQUESTED,
        seatsRequested: { lte: availableSeats },
      },
      include: {
        passenger: { select: { id: true, name: true } },
        fare: true,
      },
      orderBy: { createdAt: "asc" },
    });
  }

  /**
   * Accepts an unassigned ride request and assigns it to driver's active pool.
   */
  static async acceptRide(driverId: string, rideId: string) {
    const vehicle = await this.getDriverVehicle(driverId);
    if (!vehicle.isOnline) {
      throw new AppError("You must be online to accept rides", 400, "DRIVER_OFFLINE");
    }

    const pool = await PoolService.getOrCreateOpenPool(vehicle.id);
    return PoolService.assignRideToPool(rideId, pool.id);
  }

  /**
   * Advances status of a specific ride belonging to driver's pool.
   */
  static async advanceRideStatus(
    driverId: string,
    rideId: string,
    toStatus: RideRequestStatus,
    paymentMethod?: PaymentMethod
  ) {
    const vehicle = await this.getDriverVehicle(driverId);

    // Verify the ride belongs to driver's vehicle pool
    const ride = await prisma.rideRequest.findUnique({
      where: { id: rideId },
      include: {
        poolMember: {
          include: { pool: true },
        },
      },
    });

    if (!ride) {
      throw new AppError("Ride request not found", 404, "RIDE_NOT_FOUND");
    }

    if (ride.poolMember?.pool.vehicleId !== vehicle.id) {
      throw new AppError("This ride is not assigned to your vehicle", 403, "FORBIDDEN");
    }

    return RideLifecycle.transitionRideStatus(rideId, toStatus, driverId, {
      paymentMethod,
    });
  }

  /**
   * Advances the status of all active passengers in driver's pool simultaneously.
   */
  static async advancePoolStatus(
    driverId: string,
    toStatus: RideRequestStatus,
    paymentMethod?: PaymentMethod
  ) {
    const pool = await this.getCurrentPool(driverId);
    if (!pool || pool.members.length === 0) {
      throw new AppError("No active passengers in your pool to advance", 400, "NO_ACTIVE_POOL");
    }

    const updatedRides = [];
    for (const member of pool.members) {
      // Only advance if member's ride isn't already at or past this status
      if (member.rideRequest.status !== toStatus && member.rideRequest.status !== RideRequestStatus.COMPLETED) {
        const updated = await RideLifecycle.transitionRideStatus(
          member.rideRequestId,
          toStatus,
          driverId,
          { paymentMethod }
        );
        updatedRides.push(updated);
      }
    }

    return {
      poolId: pool.id,
      advancedTo: toStatus,
      updatedCount: updatedRides.length,
      rides: updatedRides,
    };
  }
}
