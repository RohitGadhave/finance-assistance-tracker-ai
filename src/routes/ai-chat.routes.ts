import { Router } from 'express';
import { Chat, chatConversation, firstChat } from '../controllers/ai-chat.controller';
const router = Router();



router.get('/init', firstChat);
router.post('/', Chat);
router.post('/conversation', chatConversation);

export default router;