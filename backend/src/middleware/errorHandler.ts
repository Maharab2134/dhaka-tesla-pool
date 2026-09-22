import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { sendError } from "../utils/response.js";

export class AppError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, statusCode: number = 400, code: string = "BAD_REQUEST") {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof ZodError) {
    return sendError(
      res,
      "VALIDATION_ERROR",
      "Invalid request data",
      422,
      err.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      }))
    );
  }

  if (err instanceof AppError) {
    return sendError(res, err.code, err.message, err.statusCode);
  }

  console.error("Unhandled error:", err);
  return sendError(res, "INTERNAL_SERVER_ERROR", "An unexpected error occurred", 500);
};
