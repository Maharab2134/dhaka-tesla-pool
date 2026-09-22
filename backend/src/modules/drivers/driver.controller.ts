import { Request, Response, NextFunction } from "express";
import { DriverService } from "./driver.service.js";
import { sendSuccess } from "../../utils/response.js";
import { PaymentMethod, RideRequestStatus } from "@prisma/client";
import { z } from "zod";

const toggleOnlineSchema = z.object({
  isOnline: z.boolean(),
});

const advanceRideSchema = z.object({
  status: z.nativeEnum(RideRequestStatus),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
});

export class DriverController {
  static async getVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const driverId = req.user!.id;
      const vehicle = await DriverService.getDriverVehicle(driverId);
      return sendSuccess(res, { vehicle }, 200);
    } catch (error) {
      next(error);
    }
  }

  static async toggleOnline(req: Request, res: Response, next: NextFunction) {
    try {
      const driverId = req.user!.id;
      const { isOnline } = toggleOnlineSchema.parse(req.body);
      const vehicle = await DriverService.setOnlineStatus(driverId, isOnline);
      return sendSuccess(res, { vehicle }, 200);
    } catch (error) {
      next(error);
    }
  }

  static async getCurrentPool(req: Request, res: Response, next: NextFunction) {
    try {
      const driverId = req.user!.id;
      const pool = await DriverService.getCurrentPool(driverId);
      return sendSuccess(res, { pool }, 200);
    } catch (error) {
      next(error);
    }
  }

  static async getAvailableRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const driverId = req.user!.id;
      const requests = await DriverService.getAvailableRequests(driverId);
      return sendSuccess(res, { requests }, 200);
    } catch (error) {
      next(error);
    }
  }

  static async acceptRide(req: Request, res: Response, next: NextFunction) {
    try {
      const driverId = req.user!.id;
      const rideId = req.params.id;
      const result = await DriverService.acceptRide(driverId, rideId);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  static async arrive(req: Request, res: Response, next: NextFunction) {
    try {
      const driverId = req.user!.id;
      const rideId = req.params.id;
      const ride = await DriverService.advanceRideStatus(
        driverId,
        rideId,
        RideRequestStatus.DRIVER_ARRIVED
      );
      return sendSuccess(res, { ride }, 200);
    } catch (error) {
      next(error);
    }
  }

  static async start(req: Request, res: Response, next: NextFunction) {
    try {
      const driverId = req.user!.id;
      const rideId = req.params.id;
      const ride = await DriverService.advanceRideStatus(
        driverId,
        rideId,
        RideRequestStatus.STARTED
      );
      return sendSuccess(res, { ride }, 200);
    } catch (error) {
      next(error);
    }
  }

  static async complete(req: Request, res: Response, next: NextFunction) {
    try {
      const driverId = req.user!.id;
      const rideId = req.params.id;
      const paymentMethod = req.body.paymentMethod as PaymentMethod | undefined;
      const ride = await DriverService.advanceRideStatus(
        driverId,
        rideId,
        RideRequestStatus.COMPLETED,
        paymentMethod
      );
      return sendSuccess(res, { ride }, 200);
    } catch (error) {
      next(error);
    }
  }

  static async advancePool(req: Request, res: Response, next: NextFunction) {
    try {
      const driverId = req.user!.id;
      const { status, paymentMethod } = advanceRideSchema.parse(req.body);
      const result = await DriverService.advancePoolStatus(driverId, status, paymentMethod);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }
}
