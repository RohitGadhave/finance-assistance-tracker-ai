import { ChatCompletionRole } from "groq-sdk/resources/chat/completions";

export interface ChoiceMessage {
  index: number;
        id: string;
        role: ChatCompletionRole;
        content: string;
        finish_reason: string;
        model: string;
        object: string;
        created: number;
    }
