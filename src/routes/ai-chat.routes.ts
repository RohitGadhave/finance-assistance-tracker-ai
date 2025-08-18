import { Router } from 'express';
import { Chat, chatConversation, firstChat, getChatMessages } from '../controllers/ai-chat.controller';
const router = Router();



router.get("/", getChatMessages);
router.get("/:userId", getChatMessages);
router.get('/init', firstChat);
router.post('/', Chat);
router.post('/conversation', chatConversation);

export default router;