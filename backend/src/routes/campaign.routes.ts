import { Router } from "express";
import {
  createCampaign,
  getCampaigns,
  getCampaignById,
} from "../controllers/campaign.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, createCampaign);

router.get("/", getCampaigns);

router.get("/:id", getCampaignById);

export default router;