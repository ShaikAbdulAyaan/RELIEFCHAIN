import { Router } from "express";
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
} from "../controllers/expense.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, createExpense);
router.get("/", authenticate, getExpenses);
router.get("/:id", authenticate, getExpenseById);
router.put("/:id", authenticate, updateExpense);

export default router;
