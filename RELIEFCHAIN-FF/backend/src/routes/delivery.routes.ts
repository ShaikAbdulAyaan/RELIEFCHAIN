import { Router } from "express";

import {
  createDelivery,
  getDeliveries,
  getDeliveryById,
  updateDeliveryStatus,
  updateDeliveryLocation,
} from "../controllers/delivery.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Create delivery
router.post("/", authenticate, createDelivery);

// Get all deliveries
router.get("/", getDeliveries);

// Get one delivery
router.get("/:id", getDeliveryById);

// Update delivery status
router.put(
  "/:id/status",
  authenticate,
  updateDeliveryStatus
);

// Update delivery GPS location
router.post(
  "/:id/location",
  authenticate,
  updateDeliveryLocation
);

export default router;