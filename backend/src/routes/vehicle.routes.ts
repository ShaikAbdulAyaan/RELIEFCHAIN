import { Router } from "express";

import {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
} from "../controllers/vehicle.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  createVehicle
);

router.get(
  "/",
  getVehicles
);

router.get(
  "/:id",
  getVehicleById
);

router.put(
  "/:id",
  authenticate,
  updateVehicle
);

export default router;