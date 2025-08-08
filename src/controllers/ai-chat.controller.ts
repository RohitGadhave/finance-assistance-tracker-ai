import { Request, Response } from 'express';
import { getChatCompletion } from '../services/groq.service';

export const firstChat = async (req: Request, res: Response) => {
const result = await getChatCompletion();
  res.json(result);
};