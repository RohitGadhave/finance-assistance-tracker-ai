import jwt from "jsonwebtoken";
// import bcrypt from 'bcryptjs';
import { User } from "../types/user.interface";
const SECRET_KEY = "xxxx-xxxx";
export function generateSignToken(user: any) {
  const token = jwt.sign(user, SECRET_KEY, { expiresIn: "1ms" });
  return token;
}

export function verifySignToken(token: string) {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (err:any) {
    if (err.name === "TokenExpiredError") {
      console.log("⏰ Token has expired");
    } else {
      console.log("❌ Token is invalid:", err.message);
    }
    throw Error("Token Error");
  }
}
