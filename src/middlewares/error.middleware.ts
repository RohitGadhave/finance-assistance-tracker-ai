import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction):void {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
}
