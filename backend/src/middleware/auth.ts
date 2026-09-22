import { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";
import { AuthService, TokenPayload } from "../modules/auth/auth.service.js";
import { AppError } from "./errorHandler.js";

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Missing or invalid authorization token", 401, "UNAUTHORIZED"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = AuthService.verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
};

export const requirePassenger = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new AppError("Authentication required", 401, "UNAUTHORIZED"));
  }

  if (req.user.role !== UserRole.PASSENGER) {
    return next(new AppError("Passenger access only", 403, "FORBIDDEN"));
  }

  next();
};

export const requireDriver = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new AppError("Authentication required", 401, "UNAUTHORIZED"));
  }

  if (req.user.role !== UserRole.DRIVER) {
    return next(new AppError("Driver access only", 403, "FORBIDDEN"));
  }

  next();
};
