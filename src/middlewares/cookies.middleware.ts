import { Request, Response, NextFunction } from "express";

/**
 * Middleware to attach user data from cookies
 *
 * @param {string} cookieName - Name of the cookie storing user data/JWT
 */
export function userFromCookie(cookieName = "user") {
  return (req: Request | any, res: Response, next: NextFunction) => {
    const cookieValue = req.cookies[cookieName];
    if (!cookieValue) {
      req.user = null;
      return next();
    }
    try {
      req.user =
        typeof cookieValue === "string" ? JSON.parse(cookieValue) : cookieValue;
      const userId = req.user._id || req.user.uid || null;

      if (userId) {
        req.body = req.body || {};
        req.params = req.params || {};
        req.body.userId = userId;
        req.params.userId = userId;
      }
      console.log("userId", {
        cookieValue,
        user: req.user,
        userId,
        body: req.body,
      });
    } catch (err: any) {
      console.error("Invalid cookie value:", err.message, req.user);
      req.user = null;
    }
    next();
  };
}

export function authCookie(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  try {
    if (req.body.userId || req.params.userId) {
      next();
    } else res.status(401).json({ message: "Unauthorized" });
  } catch (err: any) {
    console.error("Invalid cookie value:", err.message, req.user);
    res.status(401).json({ message: "Unauthorized" });
  }
}
