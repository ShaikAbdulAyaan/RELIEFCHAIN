import { Router } from "express";
import {
  allocateFunds,
  getCampaignFunds,
  getAllocations,
} from "../controllers/fund.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/campaign/:id", authenticate, getCampaignFunds);
router.post("/allocate", authenticate, allocateFunds);
router.get("/allocations", authenticate, getAllocations);

export default router;
