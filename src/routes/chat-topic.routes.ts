import { Router } from "express";
import {
  createChatTopic,
  getUserChatTopics,
  getChatTopicById,
  updateChatTopic,
  deleteChatTopic,
} from "../controllers/chat-topic.controller";

const router = Router();

router.post("/", createChatTopic); // Create
router.get("/user/:userId", getUserChatTopics); // Read all for user
router.get("/:id", getChatTopicById); // Read one
router.put("/:id", updateChatTopic); // Update
router.delete("/:id", deleteChatTopic); // Delete

export default router;
