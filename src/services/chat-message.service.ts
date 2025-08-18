import mongoose from "mongoose";
import { ChatMessagesModel } from "../models/chat-message.model";
import { logErrorToDB } from "../utils/error-logger.utils";
import { ChatMessages } from "../types/ai_chat.interfac";

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
