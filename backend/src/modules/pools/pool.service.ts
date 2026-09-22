import { PoolStatus, RideRequestStatus } from "@prisma/client";
import { prisma } from "../../config/database.js";
import { getDhakaArea } from "../../config/dhaka-geography.js";
import { AppError } from "../../middleware/errorHandler.js";

export class PoolService {
  /**
   * Finds or initializes an OPEN pool for an active vehicle.
   */
  static async getOrCreateOpenPool(vehicleId: string) {
    let pool = await prisma.pool.findFirst({
      where: {
        vehicleId,
        status: { in: [PoolStatus.OPEN, PoolStatus.ACTIVE] },
      },
      include: {
        vehicle: true,
        members: true,
      },
    });

    if (!pool) {
      pool = await prisma.pool.create({
        data: {
          vehicleId,
          status: PoolStatus.OPEN,
        },
        include: {
          vehicle: true,
          members: true,
        },
      });
    }

    return pool;
  }

  /**
   * Evaluates route compatibility between a candidate pool and a new ride request.
   * Compatible if:
   * 1. Same pickup area (e.g. both starting in Banani), OR
   * 2. Pool has no members yet, OR
   * 3. Pickups/destinations are in adjacent corridor zones in Dhaka.
   */
  static isRouteCompatible(
    poolPickupArea: string | null,
    poolDestinationArea: string | null,
    newPickup: string,
    newDestination: string
  ): boolean {
    // If pool has no members yet, any valid Dhaka route is compatible
    if (!poolPickupArea || !poolDestinationArea) {
      return true;
    }

    // Rule 1: Exact pickup match (e.g., Banani to anywhere)
    if (poolPickupArea === newPickup) {
      return true;
    }

    // Rule 2: Zone corridor compatibility
    const areaA1 = getDhakaArea(poolPickupArea);
    const areaA2 = getDhakaArea(newPickup);
    const areaB1 = getDhakaArea(poolDestinationArea);
    const areaB2 = getDhakaArea(newDestination);

    if (areaA1 && areaA2 && areaB1 && areaB2) {
      const samePickupZone = areaA1.zone === areaA2.zone;
      const sameDestinationZone = areaB1.zone === areaB2.zone;
      return samePickupZone || sameDestinationZone;
    }

    return false;
  }

  /**
   * Finds an available compatible pool with sufficient remaining seat capacity.
   */
  static async findCompatiblePool(
    pickupArea: string,
    destinationArea: string,
    requestedSeats: number
  ) {
    // 1. Fetch all online vehicles with OPEN or ACTIVE pools
    const openPools = await prisma.pool.findMany({
      where: {
        status: { in: [PoolStatus.OPEN, PoolStatus.ACTIVE] },
        vehicle: { isOnline: true },
      },
      include: {
        vehicle: {
          include: {
            driver: { select: { id: true, name: true } },
          },
        },
        members: {
          include: {
            rideRequest: true,
          },
        },
      },
    });

    for (const pool of openPools) {
      // Calculate occupied seats
      const occupiedSeats = pool.members.reduce((acc, m) => acc + m.seats, 0);
      const availableSeats = pool.vehicle.capacity - occupiedSeats;

      if (availableSeats < requestedSeats) {
        continue;
      }

      // Check route compatibility with existing pool members
      const existingPickup = pool.members[0]?.rideRequest.pickupArea || null;
      const existingDestination = pool.members[0]?.rideRequest.destinationArea || null;

      if (this.isRouteCompatible(existingPickup, existingDestination, pickupArea, destinationArea)) {
        return {
          pool,
          occupiedSeats,
          availableSeats,
        };
      }
    }

    return null;
  }

  /**
   * Concurrency-safe atomic transaction to assign a ride request to a pool.
   * Utilizes PostgreSQL FOR UPDATE row locking to prevent overbooking races.
   */
  static async assignRideToPool(rideRequestId: string, poolId: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Pessimistic row-level lock on the pool to serialize concurrent requests
      await tx.$queryRaw`SELECT id FROM pools WHERE id = ${poolId} FOR UPDATE`;

      // 2. Fetch the ride request
      const ride = await tx.rideRequest.findUniqueOrThrow({
        where: { id: rideRequestId },
        include: { fare: true },
      });

      if (ride.status !== RideRequestStatus.REQUESTED) {
        throw new AppError("Ride request is not in REQUESTED status", 400, "INVALID_STATUS");
      }

      // 3. Fetch pool with vehicle and members inside transaction
      const pool = await tx.pool.findUniqueOrThrow({
        where: { id: poolId },
        include: {
          vehicle: true,
          members: true,
        },
      });

      // 4. Calculate total occupied seats
      const occupiedSeats = pool.members.reduce((acc, m) => acc + m.seats, 0);
      const availableSeats = pool.vehicle.capacity - occupiedSeats;

      // STRICT CAPACITY ENFORCEMENT: Never allow occupied > capacity
      if (availableSeats < ride.seatsRequested) {
        throw new AppError(
          `Vehicle capacity exceeded. Pool has only ${availableSeats} seat(s) available, but ${ride.seatsRequested} requested.`,
          409,
          "POOL_FULL"
        );
      }

      // 5. Create pool membership
      const poolMember = await tx.poolMember.create({
        data: {
          poolId,
          rideRequestId,
          passengerId: ride.passengerId,
          seats: ride.seatsRequested,
          farePoisha: ride.fare?.finalFarePoisha || ride.estimatedFarePoisha,
        },
      });

      // 6. Transition ride request to MATCHED
      const updatedRide = await tx.rideRequest.update({
        where: { id: rideRequestId },
        data: {
          status: RideRequestStatus.MATCHED,
        },
      });

      // 7. Audit status transition
      await tx.rideStatusHistory.create({
        data: {
          rideRequestId,
          fromStatus: RideRequestStatus.REQUESTED,
          toStatus: RideRequestStatus.MATCHED,
          changedBy: "SYSTEM",
        },
      });

      // 8. If pool is now full (e.g. 3/3 for Bullet), update pool status to FULL
      const newOccupiedSeats = occupiedSeats + ride.seatsRequested;
      const isNowFull = newOccupiedSeats >= pool.vehicle.capacity;

      await tx.pool.update({
        where: { id: poolId },
        data: {
          status: isNowFull ? PoolStatus.FULL : PoolStatus.ACTIVE,
        },
      });

      return {
        ride: updatedRide,
        poolMember,
        occupiedSeats: newOccupiedSeats,
        vehicleCapacity: pool.vehicle.capacity,
        isFull: isNowFull,
      };
    });
  }

  /**
   * Attempts to auto-match a newly created ride request with an active pool.
   */
  static async autoMatchRideRequest(rideRequestId: string) {
    const ride = await prisma.rideRequest.findUnique({
      where: { id: rideRequestId },
    });

    if (!ride || ride.status !== RideRequestStatus.REQUESTED) {
      return null;
    }

    const matchCandidate = await this.findCompatiblePool(
      ride.pickupArea,
      ride.destinationArea,
      ride.seatsRequested
    );

    if (matchCandidate) {
      return this.assignRideToPool(rideRequestId, matchCandidate.pool.id);
    }

    return null;
  }

  /**
   * Retrieves active pools with live occupancy calculations.
   */
  static async getActivePools() {
    const pools = await prisma.pool.findMany({
      where: {
        status: { in: [PoolStatus.OPEN, PoolStatus.ACTIVE, PoolStatus.FULL] },
      },
      include: {
        vehicle: {
          include: {
            driver: { select: { id: true, name: true, email: true } },
          },
        },
        members: {
          include: {
            passenger: { select: { id: true, name: true } },
            rideRequest: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return pools.map((pool) => {
      const occupiedSeats = pool.members.reduce((acc, m) => acc + m.seats, 0);
      return {
        ...pool,
        occupiedSeats,
        availableSeats: Math.max(0, pool.vehicle.capacity - occupiedSeats),
      };
    });
  }
}
