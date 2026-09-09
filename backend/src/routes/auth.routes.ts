import { Router } from "express";
import {
  register,
  login,
  getMe,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getMe);

export default router;
router.get(
  "/donor-test",
  authenticate,
  requireRole("DONOR"),
  (_req, res) => {
    res.json({
      success: true,
      message: "DONOR access granted",
    });
  }
);