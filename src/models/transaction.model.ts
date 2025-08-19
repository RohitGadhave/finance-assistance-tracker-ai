import { Schema, model, Document } from "mongoose";
import { TransactionDocument } from "../types/transaction.interface";

const transactionSchema = new Schema<TransactionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, required: false, trim: true },
    source: { type: String, trim: true },
    date: { type: Date, default: Date.now },
    content:{ type:String, trim: true, required: false}
  },
  { timestamps: true }
);

export const TransactionModel = model<TransactionDocument>(
  "Transaction",
  transactionSchema
);
