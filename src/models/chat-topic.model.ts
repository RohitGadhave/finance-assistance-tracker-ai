import mongoose, { Schema } from "mongoose";
import { IChatTopic } from "../types/chat-topic.interface";

const ChatTopicSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    summary: { type: String, default: "" },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);
ChatTopicSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});
export const ChatTopicModel = mongoose.model<IChatTopic>(
  "ChatTopic",
  ChatTopicSchema
);
