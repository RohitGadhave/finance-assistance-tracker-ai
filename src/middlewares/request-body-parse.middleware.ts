import { Request,Response, NextFunction } from "express";
import { isServerless } from "../utils/utils";

export const serverlessBodyParse = (req: Request, res: Response, next:NextFunction) => {
  if (isServerless()) {
   if (req.body instanceof Buffer && req.body.length) {
      try {
        // Convert Buffer to string
        const bodyString = req.body.toString();

        // Check if it's JSON format
        if (bodyString.trim().startsWith("{")) {
          req.body = JSON.parse(bodyString);
        } else {
          // If not JSON, assume it's URL-encoded and parse it
          const urlEncodedData = new URLSearchParams(bodyString);
          const parsedData = Object.fromEntries(urlEncodedData.entries());
          req.body=parsedData;
        }
      } catch (error) {
        console.error("Error parsing request body:", error);
    }
  }
  }
  next();
};