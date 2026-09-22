import { Request, Response, NextFunction } from "express";
import { PoolService } from "./pool.service.js";
import { sendSuccess } from "../../utils/response.js";

export class PoolController {
  static async getActivePools(_req: Request, res: Response, next: NextFunction) {
    try {
      const pools = await PoolService.getActivePools();
      return sendSuccess(res, { pools }, 200);
    } catch (error) {
      next(error);
    }
  }
}
