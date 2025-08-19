import { Router } from "express";
import {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transaction.controller";

const router = Router();

router.post("/", createTransaction);       // Create
router.get("/", getTransactions);          // Read all
router.get("/:id", getTransactionById);    // Read one
router.put("/:id", updateTransaction);     // Update
router.delete("/:id", deleteTransaction);  // Delete

export default router;
