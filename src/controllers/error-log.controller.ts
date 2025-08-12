import { Request, Response } from "express";
import { ErrorLogModel } from "../models/error-log.model";
import mongoose from "mongoose";

// Get error logs for a specific user
export const getUserErrorLogs = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const logs = await ErrorLogModel.find({ userId }).sort({ timestamp: -1 });

    res.json({ count: logs.length, logs });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch error logs", details: err });
  }
};
