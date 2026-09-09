import { Router } from "express";
import {
  createBatch,
  getBatchById,
  transferBatch,
} from "../controllers/batch.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, createBatch);
router.get("/:id", getBatchById);
router.post("/:id/transfer", authenticate, transferBatch);

export default router;
