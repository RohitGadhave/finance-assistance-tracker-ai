import { Router } from 'express';
import { chatConversation, firstChat } from '../controllers/ai-chat.controller';
const router = Router();



router.get('/init', firstChat);
router.post('/init', firstChat);
router.post('/conversation', chatConversation);

export default router;