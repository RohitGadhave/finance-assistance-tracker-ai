import { Router } from 'express';
import { firstChat } from '../controllers/ai-chat.controller';
const router = Router();



router.get('/init', firstChat);

export default router;