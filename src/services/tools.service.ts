import { ChatCompletionTool, ChatCompletionToolMessageParam } from "groq-sdk/resources/chat/completions";
import { log } from "console";
import Groq from "groq-sdk";
import TransactionService from "./transaction.service";
import { AddExpenditureInput, AddIncomeInput, GetSummaryInput, GetTransactionsInput, GetTransactionsOutput, SummaryResult, TransactionDocument } from "../types/transaction.interface";
import { logErrorToDB } from "../utils/error-logger.utils";
export const DB: {
  type: "income" | "expense";
  name?: string;
  amount: number;
  date: string;
}[] = [];

type AnyToolFunction = (...args: any[]) => unknown | Promise<unknown>;

export default class ToolsService {
  private userId!:string;
  private transactionService!:TransactionService;
  private readonly toolCallFunctionsMap: Record<string, AnyToolFunction> = {
    addExpenditure: async ({
      source,
      amount,
      date,
      content,
    }: AddExpenditureInput): Promise<AddExpenditureInput> => {
      const src = source ?? "unknown";
      const isoDate = date ?? new Date().toISOString();
      const expense = { type: "expense", source: src, amount, date: isoDate };
      await this.transactionService.addExpenditure({ source: src, amount, date: isoDate,content });
      return expense;
    },
    addIncome: async ({
      source,
      amount,
      date,
      content,
    }: AddIncomeInput):Promise<AddIncomeInput>=> {
      const src = source ?? "unknown";
      const isoDate = date ?? new Date().toISOString();
      // persist to DB, return created record
      const created = { type: "income", source: src, amount, date: isoDate };
      // console.log("Adding income:", created);
      await this.transactionService.addIncome({ source: src, amount, date: isoDate,content });
      return created; // return object (not void) so the model sees a useful result
    },
    getTransactions: async ({
      type,
      from,
      to,
    }: GetTransactionsInput): Promise<GetTransactionsOutput[]> => {
      const result: GetTransactionsOutput[] = await this.transactionService.getTransactions({ type,from,to});
      return result;
      
    },
    getSummary: async ({
      from,
      to,
    }: GetSummaryInput): Promise<SummaryResult> => {
      return await this.transactionService.getSummary({from,to});
    },
    getBalance: async (): Promise<number> => {
      const balance = await this.transactionService.getBalance();
      return balance;
    },

    getExpenses: async (): Promise<
      { name: string; amount: number; date: string }[]
    > => {
      console.log("Fetching expenses");
      return [
        { name: "groceries", amount: 100, date: "2022-10-09" },
        { name: "groceries2", amount: 200, date: "2022-10-09" },
        { name: "groceries3", amount: 300, date: "2022-10-09" },
      ];
    },

    getDateRangeBalance: async ({
      from,
      to,
    }: {
      from: string;
      to: string;
    }): Promise<number> => {
      // console.log("Fetching Date Range balance for date range", from, to);
      return 1000;
    },

    getExpenditureByDateRange: async ({
      from,
      to,
    }: {
      from: string;
      to: string;
    }): Promise<{ name: string; amount: number; date: string }[]> => {
      // console.log(`Fetching expenditures from ${from} to ${to}`);
      return [{ name: "groceries", amount: 100, date: "2022-10-09" }];
    },

    getIncomeByDateRange: async ({
      from,
      to,
    }: {
      from: string;
      to: string;
    }): Promise<{ name: string; amount: number; date: string }[]> => {
      // console.log(`Fetching income from ${from} to ${to}`);
      return [{ name: "salary", amount: 1000, date: "2022-10-09" }];
    },
  };
  private readonly ChatCompletionToolConfigs: ChatCompletionTool[] = [
    {
      type: "function",
      function: {
        name: "addExpenditure",
        description: "Add an expense with amount, source, and optional date.",
        parameters: {
          type: "object",
          properties: {
            amount: { type: "number", description: "Amount spent." },
            source: { type: "string", description: "Description of expense." },
            date: { type: "string", description: "Date." },
          },
          required: ["amount", "source"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "addIncome",
        description: "Add an income with amount, source, and optional date.",
        parameters: {
          type: "object",
          properties: {
            amount: { type: "number", description: "Amount earned." },
            source: { type: "string", description: "Source of income." },
            date: { type: "string", description: "Date." },
          },
          required: ["amount", "source"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "getTransactions",
        description: "Retrieve income or expenses for an optional date range. this tool also use for getting all data in details/history",
        parameters: {
          type: "object",
          properties: {
            type: {
              type: "string",
              enum: ["income", "expense"],
              description: "Transaction type.",
            },
            from: { type: "string", description: "Start date." },
            to: { type: "string", description: "End date." },
          },
          required: ["type"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "getSummary",
        description: "Get financial summary for a date range. date in ISO format",
        parameters: {
          type: "object",
          properties: {
            from: { type: "string", description: "Start date." },
            to: { type: "string", description: "End date." },
          },
          required: ["from", "to"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "getBalance",
        description: "Get current balance.",
        parameters: { type: "object", properties: {} },
      },
    },
    //   {
    //     type: "function",
    //     function: {
    //       name: "deleteTransaction",
    //       description: "Delete a transaction by ID.",
    //       parameters: {
    //         type: "object",
    //         properties: {
    //           id: { type: "string", description: "Transaction ID." }
    //         },
    //         required: ["id"]
    //       }
    //     }
    //   },
    //   {
    //     type: "function",
    //     function: {
    //       name: "updateTransaction",
    //       description: "Update transaction details.",
    //       parameters: {
    //         type: "object",
    //         properties: {
    //           id: { type: "string", description: "Transaction ID." },
    //           amount: { type: "number", description: "Updated amount." },
    //           name: { type: "string", description: "Updated name/description." },
    //           date: { type: "string", description: "Updated date." }
    //         },
    //         required: ["id"]
    //       }
    //     }
    //   }
  ];
  constructor(userId:string){
    this.userId = userId;
    this.transactionService = new TransactionService(userId);
  }
  get tools(): ChatCompletionTool[] {
    return this.ChatCompletionToolConfigs;
  }
  public getToolCallFunction(toolName: string): AnyToolFunction | undefined {
    return this.toolCallFunctionsMap[toolName];
  }
  getToolConfigsContentTextForSystemRoleContent(): string {
    return (
      "Index. Tool Name : Description\n" +
      this.ChatCompletionToolConfigs.map(
        (tool: ChatCompletionTool, index: number) => {
          return `${index + 1}.${tool?.function?.name} : ${
            tool?.function?.description
          }`;
        }
      ).join("\n")
    );
  }

  async getExecuteToolInfo(
    toolName: string,
    argsString: string,
    prompt:string
  ): Promise<string> {
    let toolResult: any;
    const toolFn = this.getToolCallFunction(toolName);
    if (toolFn) {
      let argsParsed: any = {};
      try {
        argsParsed = JSON.parse(argsString) ?? {};
      } catch (err) {
        argsParsed = {};
      }
      argsParsed['content']=prompt;
      // console.log("function tool called", toolName, argsParsed);

      try {
        toolResult = { res: await toolFn(argsParsed) };
      } catch (err: any) {
        toolResult = { error: String(err) };
        logErrorToDB(err,{route:'toolResult',metadata:err,userId:this.userId});
      }
    } else {
      console.log("no tool function available", toolName);
      toolResult = { error: `No handler for tool ${toolName}` };
      logErrorToDB(new Error(`No handler for tool ${toolName}`),{route:'getExecuteToolInfo',userId:this.userId});
    }
    return JSON.stringify(toolResult);
  }

  async toolsLoop(toolCalls: Groq.Chat.Completions.ChatCompletionMessageToolCall[],prompt:string):Promise<ChatCompletionToolMessageParam[]> {

    if (toolCalls?.length) {
        const promises = toolCalls.map( async (toolCall):Promise<ChatCompletionToolMessageParam> => {
          const toolName = toolCall?.function?.name;
          const argsString = toolCall?.function?.arguments ?? "{}";
          const toolCallId: string = toolCall.id;
          const content = await this.getExecuteToolInfo(toolName, argsString,prompt);
          return {
            role: "tool",
            tool_call_id: toolCallId,
            content: content,
          };
        });
        return await Promise.all(promises);
    } else {
        return [];
    }
  }
}
