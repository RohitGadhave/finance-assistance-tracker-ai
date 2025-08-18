import mongoose, { Schema, Document } from "mongoose";
import { ChatMessagesDoc } from "../types/ai_chat.interfac";

const ChatMessagesSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    topicId: { type: Schema.Types.ObjectId, ref: "ChatTopic", required: false },
    role: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    metadata: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const ChatMessagesModel = mongoose.model<ChatMessagesDoc>(
  "ChatMessage",
  ChatMessagesSchema
);
