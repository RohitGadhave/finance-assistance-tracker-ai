import { ChatCompletionTool, ChatCompletionToolMessageParam } from "groq-sdk/resources/chat/completions";
import { log } from "console";
import Groq from "groq-sdk";
export const DB: {
  type: "income" | "expense";
  name?: string;
  amount: number;
  date: string;
}[] = [];

type AnyToolFunction = (...args: any[]) => unknown | Promise<unknown>;

export default class ToolsService {
  private readonly toolCallFunctionsMap: Record<string, AnyToolFunction> = {
    addExpenditure: async ({
      name,
      amount,
      date,
      content,
    }: {
      amount: number;
      name?: string;
      date?: string;
      content?: string;
    }): Promise<void> => {
      console.log(
        `Adding expenditure of amount: ${amount} for ${name ?? "N/A"} on date ${
          date ?? "N/A"
        }`
      );
      DB.push({
        type: "expense",
        name: name ?? "unknown",
        amount,
        date: date ?? new Date().toISOString().slice(0, 10),
      });
    },
    addIncome: async ({
      name,
      source,
      amount,
      date,
      content,
    }: {
      name?: string;
      source?: string;
      amount: number;
      date?: string;
      content?: string;
    }) => {
      const src = name ?? source ?? "unknown";
      const isoDate = date ?? new Date().toISOString();
      // persist to DB, return created record
      const created = { type: "income", name: src, amount, date: isoDate };
      console.log("Adding income:", created);
      DB.push({ type: "income", name: src, amount, date: isoDate });
      return created; // return object (not void) so the model sees a useful result
    },
    getTransactions: async ({
      type,
      from,
      to,
    }: {
      type: "income" | "expense";
      from?: string;
      to?: string;
    }): Promise<{ name: string; amount: number; date: string }[]> => {
      console.log(
        `Fetching ${type} transactions${
          from && to ? ` from ${from} to ${to}` : ""
        }`
      );
      const res = DB.reduce((acc: any, curr: any) => {
        if (curr.type === type) {
          acc.push({
            name: curr.name,
            amount: curr.amount,
            date: curr.date,
          });
        }
        return acc;
      }, []);
      log("Transactions fetched:", res, DB);
      return res;
      if (type === "income") {
        // Example: replace with DB call
        return [
          { name: "salary", amount: 2000, date: "2025-08-01" },
          { name: "bonus", amount: 500, date: "2025-08-05" },
        ];
      } else if (type === "expense") {
        // Example: replace with DB call
        return [
          { name: "groceries", amount: 150, date: "2025-08-02" },
          { name: "utilities", amount: 300, date: "2025-08-06" },
        ];
      }

      return [];
    },
    getSummary: async ({
      from,
      to,
    }: {
      from: string;
      to: string;
    }): Promise<{
      totalIncome: number;
      totalExpense: number;
      balance: number;
    }> => {
      console.log(`Fetching financial summary from ${from} to ${to}`);

      // Example logic — replace with DB/real data queries
      let totalIncome = 0; // e.g., sum of incomes in date range
      let totalExpense = 0; // e.g., sum of expenses in date range
      DB.forEach((transaction) => {
        if (transaction.type === "income") {
          totalIncome += transaction.amount;
        } else if (transaction.type === "expense") {
          totalExpense += transaction.amount;
        }
      });
      const balance = totalIncome - totalExpense;

      return {
        totalIncome,
        totalExpense,
        balance,
      };
    },
    getBalance: async (): Promise<number> => {
      const balance = DB.reduce((acc, curr) => {
        if (curr.type === "income") {
          return acc + curr.amount;
        } else if (curr.type === "expense") {
          return acc - curr.amount;
        }
        return acc;
      }, 0);
      console.log("Fetching balance", balance, DB);
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
      console.log("Fetching Date Range balance for date range", from, to);
      return 1000;
    },

    getExpenditureByDateRange: async ({
      from,
      to,
    }: {
      from: string;
      to: string;
    }): Promise<{ name: string; amount: number; date: string }[]> => {
      console.log(`Fetching expenditures from ${from} to ${to}`);
      return [{ name: "groceries", amount: 100, date: "2022-10-09" }];
    },

    getIncomeByDateRange: async ({
      from,
      to,
    }: {
      from: string;
      to: string;
    }): Promise<{ name: string; amount: number; date: string }[]> => {
      console.log(`Fetching income from ${from} to ${to}`);
      return [{ name: "salary", amount: 1000, date: "2022-10-09" }];
    },
  };
  private readonly ChatCompletionToolConfigs: ChatCompletionTool[] = [
    {
      type: "function",
      function: {
        name: "addExpenditure",
        description: "Add an expense with amount, name, and optional date.",
        parameters: {
          type: "object",
          properties: {
            amount: { type: "number", description: "Amount spent." },
            name: { type: "string", description: "Description of expense." },
            date: { type: "string", description: "Date." },
          },
          required: ["amount", "name"],
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
        description: "Retrieve income or expenses for an optional date range.",
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
        description: "Get financial summary for a date range.",
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
    argsString: string
  ): Promise<string> {
    let toolResult: any;
    const toolFn = this.getToolCallFunction(toolName);
    if (toolFn) {
      let argsParsed: any = {};
      try {
        argsParsed = JSON.parse(argsString);
      } catch (err) {
        argsParsed = {};
      }
      console.log("function tool called", toolName, argsParsed);

      try {
        toolResult = { res: await toolFn(argsParsed) };
      } catch (err) {
        toolResult = { error: String(err) };
      }
    } else {
      console.log("no tool function available", toolName);
      toolResult = { error: `No handler for tool ${toolName}` };
    }
    return JSON.stringify(toolResult);
  }

  async toolsLoop(toolCalls: Groq.Chat.Completions.ChatCompletionMessageToolCall[]):Promise<ChatCompletionToolMessageParam[]> {

    if (toolCalls?.length) {
        const promises = toolCalls.map( async (toolCall):Promise<ChatCompletionToolMessageParam> => {
          const toolName = toolCall?.function?.name;
          const argsString = toolCall?.function?.arguments ?? "{}";
          const toolCallId: string = toolCall.id;
          const content = await this.getExecuteToolInfo(toolName, argsString);
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
