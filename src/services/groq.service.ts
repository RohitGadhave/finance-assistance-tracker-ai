import Groq from "groq-sdk";
import { config } from "../config/env";
import {
  ChatCompletion,
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionMessage,
  ChatCompletionMessageParam,
  ChatCompletionRole,
  ChatCompletionToolChoiceOption,
  ChatCompletionToolMessageParam,
} from "groq-sdk/resources/chat/completions";
import { ChatMessages, ChoiceMessage } from "../types/ai_chat.interfac";
import ToolsService from "./tools.service";
import { addChatMessages } from "./chat-message.service";

const groq = new Groq({ apiKey: config.groqApiKey });

// export const systemMessage: ChatCompletionMessageParam = {
//   role: 'system',
//   content: `You are 'Finance Baba', a personal finance assistant. Your task is to assist helping users track income and expenses, analyze budgets, and manage financial records and planning in a friendly, concise, and clear way.
// Current datetime: ${new Date().toUTCString()}
// General rules:
// - All dates must be in YYYY-MM-DD format.
// - Amounts are positive numbers unless stated otherwise.
// - If a date is not provided, assume today's date.
// - Be concise when responding, but ensure clarity.
// - Use tools only when the user's request requires them.
// - Do not fabricate values — ask for missing information.
// - Do not call a tool more than necessary.
// You can use the following tools when needed (use only if required by the user's request):
//   ${getToolConfigsContentTextForSystemRoleContent()}`,
// };
// console.log(systemMessage);

export async function getChatCompletion(
  userId: string,
  messages: ChatCompletionMessageParam[] = [],
  loopCount = 0
): Promise<Groq.Chat.Completions.ChatCompletion> {
  if (loopCount > config.MAX_TOOL_CALL_LOOPS)
    throw new Error("Max tool loops reached");
  const toolService = new ToolsService(userId);
  const systemMessage: ChatCompletionMessageParam = {
    role: "system",
    content:
      `You are name is 'Finance Baba', a personal finance assistant. Your task is to assist helping users track income and expenses, analyze budgets, and manage financial records and planning in a friendly, concise, and clear way.
Current datetime: ${new Date().toUTCString()}
General rules:
- All dates must be in YYYY-MM-DD format.
- Amounts are positive numbers unless stated otherwise.
- If a date is not provided, assume today's date.
- Be concise when responding, but ensure clarity.
- Use tools only when the user's request requires them.
- Do not fabricate values — ask for missing information.
- Do not call a tool more than necessary.
You can use the following tools when needed (use only if required by the user's request):
  ${toolService.getToolConfigsContentTextForSystemRoleContent()}`.trim(),
  };
  const chatMessage: ChatCompletionMessageParam[] = [
    systemMessage,
    ...messages,
  ];
  const body: ChatCompletionCreateParamsNonStreaming = {
    model: config.aiModel,
    messages: chatMessage,
    max_tokens: 500,
    temperature: 0.2,
    tool_choice: "auto",
    tools: toolService.tools,
    max_completion_tokens:8192,
    // top_p: 1,
    // n: 1,
    // stop: null,
    // presence_penalty: 0,
    // frequency_penalty: 0,
    // user: 'user-id-placeholder', // Replace with actual user ID if available
    // stream: false
  };
  const completion = await groq.chat.completions.create(body);

  const choices: ChatCompletion.Choice[] = completion.choices;
  const message: ChatCompletionMessage = choices[0].message;
  const toolCalls:
    | Groq.Chat.Completions.ChatCompletionMessageToolCall[]
    | undefined = message?.tool_calls;
  let toolResponses: ChatCompletionToolMessageParam[] = [];
  if (toolCalls && toolCalls?.length) {
    const lastMessage = chatMessage[chatMessage.length-1];
    let prompt:string = '';
    if(lastMessage){
      if(lastMessage.content && typeof lastMessage.content ==='string'){
        prompt = lastMessage?.content;
      }else if(lastMessage.content && Array.isArray(lastMessage.content)){
        prompt = lastMessage.content.toString();
      }
    }
    toolResponses = await toolService.toolsLoop(toolCalls,prompt);
    console.log("tool res ", toolResponses);
    const result: ChatMessages = {
      userId,
      role: choices[0]?.finish_reason || "tool",
      content: "",
      metadata: completion as any,
    };
    await addChatMessages([result]);
    const toolCompletionResult = await getChatCompletion(
      userId,
      [...messages, message, ...toolResponses],
      loopCount + 1
    );
    if (loopCount > 1) {
      await addChatMessages([
        getChatMessageFormate(getChoiceMessage(toolCompletionResult), userId),
      ]);
    }
    return toolCompletionResult;
  }

  return completion;
}

export async function main() {
  // const chatCompletion = await getChatCompletion();
  // console.log(chatCompletion.choices[0]?.message?.content || "");
  // return chatCompletion;
}

export function getUserRoleMessage(
  message: string
): ChatCompletionMessageParam {
  return {
    role: "user",
    content: message,
  };
}

export function getChoiceMessage(
  chatCompletion: Groq.Chat.Completions.ChatCompletion,
  choiceIndex: number = 0
): ChoiceMessage {
  const choice = chatCompletion.choices?.[choiceIndex] ?? {};
  const message: ChoiceMessage = {
    index: choice.index,
    id: chatCompletion.id,
    role: choice?.message?.role,
    content: choice?.message?.content || "",
    finish_reason: choice?.finish_reason,
    model: chatCompletion.model,
    object: chatCompletion.object,
    created: chatCompletion.created,
    metadata: choice,
  };
  return message;
}

export const getChatMessageFormate = (
  message: ChatCompletionMessageParam | ChoiceMessage,
  userId: string
): ChatMessages => {
  const result: ChatMessages = {
    userId,
    role: message?.role || "",
    content: Array.isArray(message?.content)
      ? message.content.join("\n")
      : message?.content || "",
    metadata: "metadata" in message ? message.metadata : null,
  };
  return result;
};
