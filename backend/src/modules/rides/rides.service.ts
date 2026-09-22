import { RideRequestStatus, UserRole } from "@prisma/client";
import { prisma } from "../../config/database.js";
import { getDhakaArea } from "../../config/dhaka-geography.js";
import { AppError } from "../../middleware/errorHandler.js";
import { FareService } from "../fares/fare.service.js";
import { CreateRideRequestInput, EstimateFareInput } from "./rides.validation.js";

export class RidesService {
  /**
   * Estimates fare for given pickup and destination without creating a ride record.
   */
  static estimateFare(input: EstimateFareInput) {
    const pickup = getDhakaArea(input.pickupArea);
    const destination = getDhakaArea(input.destinationArea);

    if (!pickup || !destination) {
      throw new AppError("Invalid pickup or destination area", 400, "INVALID_AREA");
    }

    const pooledFare = FareService.calculateFareBetweenAreas(
      pickup,
      destination,
      true,
      input.seatsRequested
    );

    const soloFare = FareService.calculateFareBetweenAreas(
      pickup,
      destination,
      false,
      input.seatsRequested
    );

    return {
      pickupArea: pickup.name,
      destinationArea: destination.name,
      distanceKm: pooledFare.distanceKm,
      seatsRequested: input.seatsRequested,
      pooledFare: {
        baseFarePoisha: pooledFare.baseFarePoisha,
        distanceChargePoisha: pooledFare.distanceChargePoisha,
        poolDiscountPoisha: pooledFare.poolDiscountPoisha,
        finalFarePoisha: pooledFare.finalFarePoisha,
      },
      soloFare: {
        baseFarePoisha: soloFare.baseFarePoisha,
        distanceChargePoisha: soloFare.distanceChargePoisha,
        poolDiscountPoisha: soloFare.poolDiscountPoisha,
        finalFarePoisha: soloFare.finalFarePoisha,
      },
    };
  }

  /**
   * Creates a new ride request and registers initial fare & status history.
   */
  static async createRideRequest(passengerId: string, input: CreateRideRequestInput) {
    const pickup = getDhakaArea(input.pickupArea);
    const destination = getDhakaArea(input.destinationArea);

    if (!pickup || !destination) {
      throw new AppError("Invalid pickup or destination area", 400, "INVALID_AREA");
    }

    // Default ride requests are pooled to provide Tesla Pool discount
    const fareCalc = FareService.calculateFareBetweenAreas(
      pickup,
      destination,
      true,
      input.seatsRequested
    );

    // Atomically create ride request, fare record, and status audit entry
    const ride = await prisma.$transaction(async (tx) => {
      const newRide = await tx.rideRequest.create({
        data: {
          passengerId,
          pickupArea: pickup.name,
          destinationArea: destination.name,
          pickupLat: pickup.lat,
          pickupLng: pickup.lng,
          destinationLat: destination.lat,
          destinationLng: destination.lng,
          seatsRequested: input.seatsRequested,
          status: RideRequestStatus.REQUESTED,
          estimatedFarePoisha: fareCalc.finalFarePoisha,
          fare: {
            create: {
              baseFarePoisha: fareCalc.baseFarePoisha,
              distanceChargePoisha: fareCalc.distanceChargePoisha,
              poolDiscountPoisha: fareCalc.poolDiscountPoisha,
              finalFarePoisha: fareCalc.finalFarePoisha,
            },
          },
          statusHistory: {
            create: {
              fromStatus: null,
              toStatus: RideRequestStatus.REQUESTED,
              changedBy: passengerId,
            },
          },
        },
        include: {
          fare: true,
          passenger: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return newRide;
    });

    return ride;
  }

  /**
   * Retrieves all ride requests submitted by a specific passenger.
   */
  static async getPassengerRides(passengerId: string) {
    return prisma.rideRequest.findMany({
      where: { passengerId },
      orderBy: { createdAt: "desc" },
      include: {
        fare: true,
        poolMember: {
          include: {
            pool: {
              include: {
                vehicle: {
                  include: {
                    driver: { select: { id: true, name: true } },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Retrieves specific ride details with ownership authorization check.
   */
  static async getRideById(
    rideId: string,
    requestingUserId: string,
    requestingUserRole: UserRole
  ) {
    const ride = await prisma.rideRequest.findUnique({
      where: { id: rideId },
      include: {
        fare: true,
        statusHistory: {
          orderBy: { createdAt: "asc" },
        },
        poolMember: {
          include: {
            pool: {
              include: {
                vehicle: {
                  include: {
                    driver: { select: { id: true, name: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!ride) {
      throw new AppError("Ride request not found", 404, "RIDE_NOT_FOUND");
    }

    // Ownership rule: Passenger can only view their own ride. Drivers can view matched rides.
    if (requestingUserRole === UserRole.PASSENGER && ride.passengerId !== requestingUserId) {
      throw new AppError(
        "You are not authorized to access this ride request",
        403,
        "FORBIDDEN"
      );
    }

    return ride;
  }
}
