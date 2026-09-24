import { Request, Response, NextFunction } from "express";
import { AdminService } from "./admin.service.js";
import { sendSuccess } from "../../utils/response.js";
import { z } from "zod";

const simulateStepSchema = z.object({
  step: z.enum([
    "step1_online",
    "step2_nusrat",
    "step3_rafiq",
    "step4_shirin",
    "step5_overflow",
    "step6_advance",
    "step7_complete",
  ]),
});

export class AdminController {
  static async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getOverview();
      sendSuccess(res, data, 200);
    } catch (err) {
      next(err);
    }
  }

  static async resetDemo(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AdminService.resetDemo();
      sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  }

  static async simulateStep(req: Request, res: Response, next: NextFunction) {
    try {
      const { step } = simulateStepSchema.parse(req.body);
      const result = await AdminService.simulateStep(step);
      sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  }
}
