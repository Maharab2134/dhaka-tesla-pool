import express, { Express, Request, Response } from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { sendSuccess } from "./utils/response.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { ridesRoutes } from "./modules/rides/rides.routes.js";
import { poolRoutes } from "./modules/pools/pool.routes.js";
import { driverRoutes } from "./modules/drivers/driver.routes.js";
import { adminRoutes } from "./modules/admin/admin.routes.js";

export const createApp = (): Express => {
  const app = express();

  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    })
  );
  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (_req: Request, res: Response) => {
    return sendSuccess(res, {
      status: "healthy",
      service: "dhaka-tesla-pool-api",
      tagline: "Share a seat. Split the fare. Survive Dhaka traffic.",
      timestamp: new Date().toISOString(),
    });
  });

  // API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/rides", ridesRoutes);
  app.use("/api/pools", poolRoutes);
  app.use("/api/driver", driverRoutes);
  app.use("/api/admin", adminRoutes);

  // Global error handler
  app.use(errorHandler);

  return app;
};
