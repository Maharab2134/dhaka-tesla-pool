import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service.js";
import { registerSchema, loginSchema } from "./auth.validation.js";
import { sendSuccess } from "../../utils/response.js";

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const input = registerSchema.parse(req.body);
      const result = await AuthService.register(input);
      return sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const input = loginSchema.parse(req.body);
      const result = await AuthService.login(input);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const user = await AuthService.getMe(userId);
      return sendSuccess(res, { user }, 200);
    } catch (error) {
      next(error);
    }
  }
}
