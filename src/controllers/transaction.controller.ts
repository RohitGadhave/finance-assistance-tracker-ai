import { Request, Response } from "express";
import { TransactionModel } from "../models/transaction.model";
import { TransactionDocument } from "../types/transaction.interface";

// Create new transaction
export const createTransaction = async (req: Request, res: Response) => {
  try {
    const transaction = new TransactionModel(req.body as TransactionDocument);
    const savedTransaction = await transaction.save();
    res.status(201).json(savedTransaction);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// Get all transactions (with optional filters)
export const getTransactions = async (req: Request, res: Response) => {
  try {
    const { userId, type, startDate, endDate } = req.query;

    const filter: any = {};
    if (userId) filter.userId = userId;
    if (type) filter.type = type;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    const transactions = await TransactionModel.find(filter,{ source: 1, amount: 1, date: 1, _id: 0,
      type: 1, }).sort({ date: -1 });
    res.json(transactions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Get single transaction by ID
export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const transaction = await TransactionModel.findById(req.params.id);
    if (!transaction) return res.status(404).json({ error: "Not found" });
    res.json(transaction);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Update transaction
export const updateTransaction = async (req: Request, res: Response) => {
  try {
    const transaction = await TransactionModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!transaction) return res.status(404).json({ error: "Not found" });
    res.json(transaction);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// Delete transaction
export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const transaction = await TransactionModel.findByIdAndDelete(req.params.id);
    if (!transaction) return res.status(404).json({ error: "Not found" });
    res.json({ message: "TransactionModel deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
