import { Request, Response } from "express";
import {
  getChatCompletion,
  getChatMessageFormate,
  getChoiceMessage,
  getUserRoleMessage,
} from "../services/groq.service";
import { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";
import data from "../dump/chat-backup.json";
import { DB } from "../services/tools.service";
import mongoose from "mongoose";
import { ChatMessagesModel } from "../models/chat-message.model";
import { ChatMessages } from "../types/ai_chat.interfac";
import { addChatMessages } from "../services/chat-message.service";
import { logErrorToDB } from "../utils/error-logger.utils";
const chatMessageBackupTemp: ChatCompletionMessageParam[] = [];
export const firstChat = async (req: Request, res: Response) => {
  const body = req.body;
  chatMessageBackupTemp.push(
    getUserRoleMessage(body?.message || "Hello, how can you assist me today?")
  );
  const result = await getChatCompletion(body.userId, chatMessageBackupTemp);
  const message = getChoiceMessage(result);
  chatMessageBackupTemp.push({
    role: "assistant",
    content: message.content,
  });
  res.json({ result, message, chatMessageBackupTemp });
};

export const Chat = async (req: Request, res: Response) => {
  const { userId, message } = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(userId) || !message) {
      throw Error("User id not valid");
    }
    const userMessage = getUserRoleMessage(message);
    await addChatMessages([getChatMessageFormate(userMessage, userId)]);
    const result = await getChatCompletion(userId, [userMessage]);
    const resultCM = getChoiceMessage(result);
    await addChatMessages([getChatMessageFormate(resultCM, userId)]);
    res.json({ data: resultCM.content });
  } catch (error:any) {
    console.error(error);
    await logErrorToDB(error,{route:'Chat',metadata:error,userId:userId,statusCode:500});
    res.status(500).json({ error: "Failed to do conversation", details: error });
  }
};

export const chatConversation = async (req: Request, res: Response) => {
  const body = req.body;
  // if (!body?.message) {
  //   return res.status(400).json({ error: "Message is required" });
  // }
  // const chatMessageBackupTemp = data as ChatCompletionMessageParam[];
  // chatMessageBackupTemp.push(getUserRoleMessage(body?.message));
  // const result = await getChatCompletion(chatMessageBackupTemp);
  // const message = getChoiceMessage(result);

  // chatMessageBackupTemp.push({
  //   role: "assistant",
  //   content: message.content,
  // });
  res.json({ chatMessageBackupTemp, DB });
};

export const getChatMessages = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const result = await ChatMessagesModel.find({ userId }).sort({
      timestamp: 1,
    });

    res.json({ count: result.length, data: result });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch error logs", details: err });
  }
};
