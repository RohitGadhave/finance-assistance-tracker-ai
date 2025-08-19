import { Schema } from "mongoose";

export type TransactionType = "income" | "expense";

export interface BaseTransaction {
  userId: string | Schema.Types.ObjectId;
  type: TransactionType;
  name: string;
  amount: number;
  category?: string;
  source?: string;
  date: Date | string; // YYYY-MM-DD format
  content?: string;
}

export interface TransactionDocument extends BaseTransaction {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

// --- Input Types ---

export interface AddExpenditureInput {
  name?: string;
  amount: number;
  source?: string;
  date?: string | Date;
  content?: string;
}

export interface AddIncomeInput {
  source?: string;
  amount: number;
  date?: string | Date;
  content?: string;
}

export interface GetTransactionsInput {
  type: TransactionType;
  from?: string;
  to?: string;
}

export interface GetSummaryInput {
  from?: string;
  to?: string;
}

export interface GetDateRangeInput {
  from: string;
  to: string;
}

// --- Output Types ---

export interface SummaryResult {
  income: number;
  expense: number;
  balance: number;
}

export interface GetTransactionsDBResult{ 
  source: string; 
  amount: number; 
  date: string 
}
export interface GetTransactionsOutput {
  a: number;
  s: string;
  d: string;
}