import { Router } from "express";
import {
  createInventory,
  getInventory,
  updateInventory,
} from "../controllers/inventory.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, createInventory);
router.get("/", getInventory);
router.put("/:id", authenticate, updateInventory);

export default router;
