import { ErrorLogModel } from "../models/error-log.model";
import mongoose from "mongoose";

export const logErrorToDB = async (
  error: Error,
  context: {
    route?: string;
    method?: string;
    statusCode?: number;
    metadata?: Record<string, any>;
    userId?: mongoose.Types.ObjectId;
  }
) => {
  try {
    await ErrorLogModel.create({
      message: error.message,
      stack: error.stack,
      route: context.route,
      method: context.method,
      statusCode: context.statusCode,
      metadata: context.metadata,
      userId: context.userId,
    });
  } catch (logErr) {
    console.error("Failed to log error:", logErr);
  }
};
