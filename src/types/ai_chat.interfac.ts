import { ChatCompletionRole } from "groq-sdk/resources/chat/completions";
export interface Metadata {
  [key: string]: string | number | boolean | null;
}

export interface ChoiceMessage {
  index: number;
  id: string;
  role: ChatCompletionRole;
  content: string;
  finish_reason: string;
  model: string;
  object: string;
  created: number;
  metadata: any;
}

export interface ChatMessages {
  id?: string;
  userId: string;
  role: string;
  content: string;
  metadata:Record<string, unknown>;
  topicId?:string;
}

export interface ChatMessagesDoc extends Document,ChatMessages {
}