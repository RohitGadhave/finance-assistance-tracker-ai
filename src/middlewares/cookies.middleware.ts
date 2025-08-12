import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to attach user data from cookies
 * 
 * @param {string} cookieName - Name of the cookie storing user data/JWT
 */
export function userFromCookie(cookieName = 'user') {
    return (req:Request | any, res:Response, next:NextFunction) => {
        const cookieValue = req.cookies[cookieName];
        if (!cookieValue) {
            req.user = null;
            return next();
        }
        try {
          req.user = JSON.parse(cookieValue);
        } catch (err:any) {
            console.error('Invalid cookie value:', err.message);
            req.user = null;
        }
        next();
    };
}
