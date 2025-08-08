import Groq from 'groq-sdk';
import { config } from '../config/env';
import { ChatCompletionCreateParamsNonStreaming, ChatCompletionMessageParam, ChatCompletionRole } from 'groq-sdk/resources/chat/completions';
import { ChoiceMessage } from '../types/ai_chat.interfac';

const groq = new Groq({ apiKey: config.groqApiKey });

export const systemMessage: ChatCompletionMessageParam = {
  role: 'system',
  content: `You are 'Finance Baba', a personal finance assistant. Your task is to assist user with their expenses, balances and financial planning. You are a helpful assistant and you will always answer in a friendly manner. You will always answer in the language of the user. current datetime: ${new Date().toUTCString()}`
};

export async function getChatCompletion(messages:ChatCompletionMessageParam[] =[]): Promise<Groq.Chat.Completions.ChatCompletion> {

    const aiConfigBody:ChatCompletionCreateParamsNonStreaming = {
        model: config.aiModel,
        messages: [
            systemMessage,
            ...messages
        ],
    };
  return groq.chat.completions.create(aiConfigBody);
}

export async function main() {
  const chatCompletion = await getChatCompletion();
  console.log(chatCompletion.choices[0]?.message?.content || '');
  return chatCompletion;
}

export function getUserRoleMessage(message:string):ChatCompletionMessageParam {
    return {
        role: 'user',
        content: message
    };
}

export function getChoiceMessage (chatCompletion: Groq.Chat.Completions.ChatCompletion,choiceIndex:number = 0):ChoiceMessage{
    const choice = chatCompletion.choices?.[choiceIndex] ?? {};
    const message:ChoiceMessage = {
        index: choice.index,
        id: chatCompletion.id,
        role: choice?.message?.role,
        content: choice?.message?.content || '',
        finish_reason: choice?.finish_reason,
        model: chatCompletion.model,
        object: chatCompletion.object,
        created: chatCompletion.created
    };
    return message;
}