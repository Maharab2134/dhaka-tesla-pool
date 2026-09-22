import { PaymentMethod, PaymentStatus, PoolStatus, Prisma, RideRequestStatus } from "@prisma/client";
import { prisma } from "../../config/database.js";
import { AppError } from "../../middleware/errorHandler.js";

export const ALLOWED_RIDE_TRANSITIONS: Record<RideRequestStatus, RideRequestStatus[]> = {
  [RideRequestStatus.REQUESTED]: [RideRequestStatus.MATCHED, RideRequestStatus.CANCELLED],
  [RideRequestStatus.MATCHED]: [RideRequestStatus.DRIVER_ARRIVED, RideRequestStatus.CANCELLED],
  [RideRequestStatus.DRIVER_ARRIVED]: [RideRequestStatus.STARTED, RideRequestStatus.CANCELLED],
  [RideRequestStatus.STARTED]: [RideRequestStatus.COMPLETED],
  [RideRequestStatus.COMPLETED]: [],
  [RideRequestStatus.CANCELLED]: [],
};

export class RideLifecycle {
  /**
   * Checks if a transition from current status to target status is valid.
   */
  static canTransition(from: RideRequestStatus, to: RideRequestStatus): boolean {
    const allowed = ALLOWED_RIDE_TRANSITIONS[from];
    return allowed ? allowed.includes(to) : false;
  }

  /**
   * Throws an AppError if the requested transition is illegal.
   */
  static validateTransition(from: RideRequestStatus, to: RideRequestStatus) {
    if (!this.canTransition(from, to)) {
      throw new AppError(
        `Invalid ride status transition from ${from} to ${to}`,
        400,
        "INVALID_STATE_TRANSITION"
      );
    }
  }

  /**
   * Atomically transitions a ride request to a new status with full audit history,
   * payment generation upon completion, and pool capacity management upon cancellation.
   */
  static async transitionRideStatus(
    rideId: string,
    toStatus: RideRequestStatus,
    changedBy: string,
    options?: {
      paymentMethod?: PaymentMethod;
      tx?: Prisma.TransactionClient;
    }
  ) {
    const execute = async (tx: Prisma.TransactionClient) => {
      const ride = await tx.rideRequest.findUniqueOrThrow({
        where: { id: rideId },
        include: {
          fare: true,
          poolMember: {
            include: { pool: { include: { members: true, vehicle: true } } },
          },
        },
      });

      // Validate FSM transition
      this.validateTransition(ride.status, toStatus);

      // 1. Update RideRequest status
      const updatedRide = await tx.rideRequest.update({
        where: { id: rideId },
        data: { status: toStatus },
        include: {
          fare: true,
          statusHistory: { orderBy: { createdAt: "asc" } },
          poolMember: {
            include: {
              pool: {
                include: {
                  vehicle: { include: { driver: true } },
                },
              },
            },
          },
        },
      });

      // 2. Record audit trail in RideStatusHistory
      await tx.rideStatusHistory.create({
        data: {
          rideRequestId: rideId,
          fromStatus: ride.status,
          toStatus,
          changedBy,
        },
      });

      // 3. Lifecycle side-effects
      if (toStatus === RideRequestStatus.COMPLETED) {
        // Record payment settlement
        const amountPoisha = ride.fare?.finalFarePoisha || ride.estimatedFarePoisha;
        await tx.payment.create({
          data: {
            rideRequestId: rideId,
            passengerId: ride.passengerId,
            amountPoisha,
            method: options?.paymentMethod || PaymentMethod.CASH,
            status: PaymentStatus.PAID,
          },
        });

        // If pool is associated, check if all pool members have completed
        if (ride.poolMember) {
          const poolId = ride.poolMember.poolId;
          const otherMembers = await tx.poolMember.findMany({
            where: { poolId },
            include: { rideRequest: true },
          });

          const allCompleted = otherMembers.every(
            (m) =>
              m.rideRequestId === rideId ||
              m.rideRequest.status === RideRequestStatus.COMPLETED
          );

          if (allCompleted) {
            await tx.pool.update({
              where: { id: poolId },
              data: { status: PoolStatus.COMPLETED },
            });
          }
        }
      } else if (toStatus === RideRequestStatus.CANCELLED) {
        // If cancelled, remove pool member to release vehicle seats
        if (ride.poolMember) {
          const poolId = ride.poolMember.poolId;
          await tx.poolMember.delete({
            where: { id: ride.poolMember.id },
          });

          // Check if pool can now be reopened
          const remainingMembers = await tx.poolMember.findMany({
            where: { poolId },
          });
          const pool = await tx.pool.findUnique({
            where: { id: poolId },
            include: { vehicle: true },
          });

          if (pool) {
            const occupiedSeats = remainingMembers.reduce((acc, m) => acc + m.seats, 0);
            if (occupiedSeats < pool.vehicle.capacity && pool.status === PoolStatus.FULL) {
              await tx.pool.update({
                where: { id: poolId },
                data: { status: PoolStatus.ACTIVE },
              });
            }
          }
        }
      }

      return updatedRide;
    };

    if (options?.tx) {
      return execute(options.tx);
    }

    return prisma.$transaction(execute);
  }
}
