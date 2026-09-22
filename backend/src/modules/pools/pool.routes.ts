import { Router } from "express";
import { PoolController } from "./pool.controller.js";
import { authenticate } from "../../middleware/auth.js";

const router = Router();

router.get("/active", authenticate, PoolController.getActivePools);

export const poolRoutes = router;
