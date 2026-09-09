import { Router } from "express";
import {
  createDonation,
  getDonations,
  getDonationById,
} from "../controllers/donation.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, createDonation);
router.get("/", getDonations);
router.get("/:id", getDonationById);

export default router;
