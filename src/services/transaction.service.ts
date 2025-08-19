import { TransactionModel } from "../models/transaction.model";

import {
  AddExpenditureInput,
  AddIncomeInput,
  GetTransactionsInput,
  GetSummaryInput,
  GetDateRangeInput,
  TransactionDocument,
  SummaryResult,
  GetTransactionsOutput,
  GetTransactionsDBResult,
} from "../types/transaction.interface";

export class TransactionService {
  private readonly userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async addExpenditure(
    input: AddExpenditureInput
  ): Promise<TransactionDocument> {
    const { source, amount, date, content } = input;
    return await TransactionModel.create({
      userId: this.userId,
      type: "expense",
      source: source ?? "unknown",
      amount: +amount,
      date: date ?? new Date().toISOString().slice(0, 10),
      content,
    });
  }

  async addIncome(input: AddIncomeInput): Promise<TransactionDocument> {
    const { source, amount, date, content } = input;
    const name = source ?? "unknown";
    const isoDate = date ?? new Date().toISOString();

    return await TransactionModel.create({
      userId: this.userId,
      type: "income",
      source: name,
      amount: +amount,
      date: isoDate,
      content,
    });
  }

  async getTransactions(
    input: GetTransactionsInput
  ): Promise<GetTransactionsOutput[]> {
    const { type, from, to } = input;
    const query: Record<string, any> = { userId: this.userId, type };

    if (from) {
      query.date = {};
      query.date["$gte"] = from;
    }
    if (to) {
      if (!query?.date) {
        query.date = {};
      }
      query.date["$lte"] = to;
    }

    const results = await TransactionModel.find(query, {
      source: 1,
      amount: 1,
      date: 1,
      _id: 0,
    }).lean<GetTransactionsDBResult[]>();
    return results.map((tran) => {
      return { a: tran.amount, s: tran.source, d: tran.date };
    });
  }

  async getSummary(input: GetSummaryInput): Promise<SummaryResult> {
    const { from, to } = input;
    const query: Record<string, unknown> = { userId: this.userId };

    if (from && to) {
      query.date = { $gte: from, $lte: to };
    }

    const transactions = await TransactionModel.find(query, {
      source: 1,
      amount: 1,
      type: 1,
      _id: 0,
    }).lean<TransactionDocument[]>();
    let totalIncome = 0;
    let totalExpense = 0;
    transactions.forEach((transaction) => {
        const amount = transaction.amount;
      if (transaction.type === "income") totalIncome += amount;
      if (transaction.type === "expense") totalExpense += amount;
    });

    return {
      income: totalIncome,
      expense: totalExpense,
      balance: totalIncome - totalExpense,
    };
  }

  async getBalance(): Promise<number> {
    const transactions = await TransactionModel.find({
      userId: this.userId,
    }).lean<TransactionDocument[]>();

    return transactions.reduce((acc, curr) => {
      if (curr.type === "income") return acc + curr.amount;
      if (curr.type === "expense") return acc - curr.amount;
      return acc;
    }, 0);
  }

  async getExpenses(): Promise<TransactionDocument[]> {
    return await TransactionModel.find({
      userId: this.userId,
      type: "expense",
    }).lean<TransactionDocument[]>();
  }

  async getDateRangeBalance(input: GetDateRangeInput): Promise<number> {
    const { from, to } = input;

    const transactions = await TransactionModel.find({
      userId: this.userId,
      date: { $gte: from, $lte: to },
    }).lean<TransactionDocument[]>();

    return transactions.reduce((acc, curr) => {
      if (curr.type === "income") return acc + curr.amount;
      if (curr.type === "expense") return acc - curr.amount;
      return acc;
    }, 0);
  }

  async getExpenditureByDateRange(
    input: GetDateRangeInput
  ): Promise<TransactionDocument[]> {
    const { from, to } = input;

    return await TransactionModel.find({
      userId: this.userId,
      type: "expense",
      date: { $gte: from, $lte: to },
    }).lean<TransactionDocument[]>();
  }

  async getIncomeByDateRange(
    input: GetDateRangeInput
  ): Promise<TransactionDocument[]> {
    const { from, to } = input;

    return await TransactionModel.find({
      userId: this.userId,
      type: "income",
      date: { $gte: from, $lte: to },
    }).lean<TransactionDocument[]>();
  }
}

export default TransactionService;
