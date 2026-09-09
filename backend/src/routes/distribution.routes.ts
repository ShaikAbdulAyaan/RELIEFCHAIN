import { Router } from "express";
import {
  createDistribution,
  getDistributions,
  getDistributionById,
} from "../controllers/distribution.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, createDistribution);
router.get("/", getDistributions);
router.get("/:id", getDistributionById);

export default router;
