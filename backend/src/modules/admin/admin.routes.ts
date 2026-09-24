import { Router } from "express";
import { AdminController } from "./admin.controller.js";

export const adminRoutes = Router();

// Public / Evaluator endpoints for seamless assessment and testing
adminRoutes.get("/overview", AdminController.getOverview);
adminRoutes.post("/reset-demo", AdminController.resetDemo);
adminRoutes.post("/simulate-step", AdminController.simulateStep);
