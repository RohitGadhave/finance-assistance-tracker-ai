import mongoose, { Schema, Document } from "mongoose";

export interface IErrorLog extends Document {
  message: string;
  stack?: string;
  route?: string;
  method?: string;
  statusCode?: number;
  timestamp: Date;
  metadata?: Record<string, any>;
  userId?: mongoose.Types.ObjectId;
}

const ErrorLogSchema: Schema = new Schema({

  message: { type: String, required: true },
  stack: { type: String },
  route: { type: String },
  method: { type: String },
  prompt: { type: String },
  statusCode: { type: Number },
  timestamp: { type: Date, default: Date.now },
  metadata: { type: Schema.Types.Mixed },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
},
  {
    timestamps: false
  });

export const ErrorLogModel = mongoose.model<IErrorLog>("ErrorLog", ErrorLogSchema);
