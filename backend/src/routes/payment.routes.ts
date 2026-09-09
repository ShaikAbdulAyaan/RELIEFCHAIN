import { Router } from "express";
import {
  simulatePayment,
  getPaymentById,
} from "../controllers/payment.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/simulate",
  authenticate,
  simulatePayment
);

router.get(
  "/:id",
  getPaymentById
);

export default router;