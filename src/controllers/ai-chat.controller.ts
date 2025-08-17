import { Request, Response } from "express";
import {
  getChatCompletion,
  getChoiceMessage,
  getUserRoleMessage,
} from "../services/groq.service";
import { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";
import data from "../dump/chat-backup.json";
import { DB } from "../services/tools.service";
import mongoose from "mongoose";
const chatMessageBackupTemp: ChatCompletionMessageParam[] = [];
export const firstChat = async (req: Request, res: Response) => {
  const body = req.body;
  chatMessageBackupTemp.push(
    getUserRoleMessage(body?.message || "Hello, how can you assist me today?")
  );
  const result = await getChatCompletion(chatMessageBackupTemp);
  const message = getChoiceMessage(result);
  chatMessageBackupTemp.push({
    role: "assistant",
    content: message.content,
  });
  res.json({ result, message, chatMessageBackupTemp });
};

export const Chat = async (req: Request, res: Response) => {
  try {
    const { userId, message } = req.body;
    if (!mongoose.Types.ObjectId.isValid(userId) || !message) {
      throw Error("User id not valid");
    }
    const messages = [getUserRoleMessage(message)];
    const result = await getChatCompletion(messages);
    const resultCM = getChoiceMessage(result);
    res.json({ result, resultCM });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch topics", details: error });
  }
};

export const chatConversation = async (req: Request, res: Response) => {
  const body = req.body;
  if (!body?.message) {
    return res.status(400).json({ error: "Message is required" });
  }
  const chatMessageBackupTemp = data as ChatCompletionMessageParam[];
  chatMessageBackupTemp.push(getUserRoleMessage(body?.message));
  const result = await getChatCompletion(chatMessageBackupTemp);
  const message = getChoiceMessage(result);

  chatMessageBackupTemp.push({
    role: "assistant",
    content: message.content,
  });
  res.json({ result, message, chatMessageBackupTemp, DB });
};
