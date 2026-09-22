import { Router } from "express";
import { RidesController } from "./rides.controller.js";
import { authenticate, requirePassenger } from "../../middleware/auth.js";

const router = Router();

// Public / client-facing fare estimation
router.post("/estimate", RidesController.estimateFare);

// Passenger-only endpoints
router.post("/", authenticate, requirePassenger, RidesController.createRideRequest);
router.get("/my-rides", authenticate, requirePassenger, RidesController.getMyRides);

// Specific ride details with authorization
router.get("/:id", authenticate, RidesController.getRideById);
router.post("/:id/cancel", authenticate, requirePassenger, RidesController.cancelRide);

export const ridesRoutes = router;
