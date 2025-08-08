import Groq from 'groq-sdk';
import { config } from '../config/env';
import { ChatCompletionCreateParamsNonStreaming, ChatCompletionMessageParam, ChatCompletionRole } from 'groq-sdk/resources/chat/completions';

const groq = new Groq({ apiKey: config.groqApiKey });

export async function getChatCompletion(messages:ChatCompletionMessageParam[] =[]): Promise<Groq.Chat.Completions.ChatCompletion> {

    const aiConfigBody:ChatCompletionCreateParamsNonStreaming = {
        model: config.aiModel,
        messages: [
            {
                role: 'system',
                content: `You are Rohit, a personal finance assistant. Your task is to assist user with their expenses, balances and financial planning. You are a helpful assistant and you will always answer in a friendly manner. You will always answer in the language of the user.
                current datetime: ${new Date().toUTCString()}`
            },
            {
                role: 'user',
                content: 'What is the importance of fast language models?'
            },
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
