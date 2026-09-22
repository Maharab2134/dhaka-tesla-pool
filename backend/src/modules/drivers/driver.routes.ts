import { Router } from "express";
import { DriverController } from "./driver.controller.js";
import { authenticate, requireDriver } from "../../middleware/auth.js";

const router = Router();

// Apply auth & driver requirement across all driver routes
router.use(authenticate, requireDriver);

router.get("/vehicle", DriverController.getVehicle);
router.patch("/online", DriverController.toggleOnline);
router.get("/pool/current", DriverController.getCurrentPool);
router.get("/requests", DriverController.getAvailableRequests);

router.post("/rides/:id/accept", DriverController.acceptRide);
router.post("/rides/:id/arrive", DriverController.arrive);
router.post("/rides/:id/start", DriverController.start);
router.post("/rides/:id/complete", DriverController.complete);
router.post("/pool/advance", DriverController.advancePool);

export const driverRoutes = router;
