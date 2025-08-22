import mongoose from "mongoose";
import { ChatMessagesModel } from "../models/chat-message.model";
import { logErrorToDB } from "../utils/error-logger.utils";
import { ChatMessages } from "../types/ai_chat.interfac";
import { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";

export const addChatMessages = async (
  messages: ChatMessages[]
) => {
  try {
    if (messages && !Array.isArray(messages) || messages.length == 0 ) {
      return [];
    }
    return await ChatMessagesModel.insertMany(messages);
  } catch (err: any) {
    logErrorToDB(err, {});
  }
};

export const getUserLastChatMessages = async (userId:string):Promise<ChatCompletionMessageParam[]> =>{
    const lastMessages:ChatCompletionMessageParam[] = [];
   const result = await ChatMessagesModel.find({userId,role:{$in:["assistant", "user"]}},{role:1,content:1}).limit(5).sort({"createdAt": -1}).lean();
   result.forEach((message)=>{
    lastMessages.unshift({
      role:message.role as any,
      content:message.content
    });
   });
return lastMessages;
};
