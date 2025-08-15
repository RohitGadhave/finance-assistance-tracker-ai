import mongoose from "mongoose";

export interface IChatTopic extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  createdAt: Date;
  lastActivity: Date;
}