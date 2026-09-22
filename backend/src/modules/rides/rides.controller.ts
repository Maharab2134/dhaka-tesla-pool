import { Request, Response, NextFunction } from "express";
import { RidesService } from "./rides.service.js";
import { createRideRequestSchema, estimateFareSchema } from "./rides.validation.js";
import { sendSuccess } from "../../utils/response.js";

export class RidesController {
  static async estimateFare(req: Request, res: Response, next: NextFunction) {
    try {
      const input = estimateFareSchema.parse(req.body);
      const estimate = RidesService.estimateFare(input);
      return sendSuccess(res, estimate, 200);
    } catch (error) {
      next(error);
    }
  }

  static async createRideRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const passengerId = req.user!.id;
      const input = createRideRequestSchema.parse(req.body);
      const ride = await RidesService.createRideRequest(passengerId, input);
      return sendSuccess(res, { ride }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getMyRides(req: Request, res: Response, next: NextFunction) {
    try {
      const passengerId = req.user!.id;
      const rides = await RidesService.getPassengerRides(passengerId);
      return sendSuccess(res, { rides }, 200);
    } catch (error) {
      next(error);
    }
  }

  static async getRideById(req: Request, res: Response, next: NextFunction) {
    try {
      const rideId = req.params.id;
      const requestingUserId = req.user!.id;
      const requestingUserRole = req.user!.role;
      const ride = await RidesService.getRideById(
        rideId,
        requestingUserId,
        requestingUserRole
      );
      return sendSuccess(res, { ride }, 200);
    } catch (error) {
      next(error);
    }
  }
}
