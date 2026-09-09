import { Router } from "express";
import {
  createBeneficiary,
  getBeneficiaries,
  getBeneficiaryById,
} from "../controllers/beneficiary.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, createBeneficiary);
router.get("/", getBeneficiaries);
router.get("/:id", getBeneficiaryById);

export default router;