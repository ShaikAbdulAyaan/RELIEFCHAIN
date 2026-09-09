import { Router } from "express";
import {
  createDisaster,
  getDisasters,
  getDisasterById,
} from "../controllers/disaster.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  createDisaster
);

router.get(
  "/",
  getDisasters
);

router.get(
  "/:id",
  getDisasterById
);

export default router;