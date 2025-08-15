import mongoose, { Schema, Document } from "mongoose";
import { User } from "../types/user.interface";


const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true
  }
);

export const UserModel = mongoose.model<User>("User", UserSchema);
