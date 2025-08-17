import { Request, Response } from "express";
import { ChatTopicModel } from "../models/chat-topic.model";
import mongoose from "mongoose";

// Create a new topic
export const createChatTopic = async (req: Request, res: Response) => {
  try {
    const { title, userId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    const topic = new ChatTopicModel({ title, userId });
    await topic.save();
    res.status(201).json(topic);
  } catch (err) {
    res.status(500).json({ error: "Failed to create topic", details: err });
  }
};

// Get all topics for a user
export const getUserChatTopics = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.json([]);
    }
    const topics = await ChatTopicModel.find({ userId },{userId:1,title:1,summary:1}).sort({ updatedAt: -1 });
    res.json(topics);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch topics", details: err });
  }
};

// Get a single topic by ID
export const getChatTopicById = async (req: Request, res: Response) => {
  try {
    const topic = await ChatTopicModel.findById(req.params.id);
    if (!topic) return res.status(404).json({ error: "Topic not found" });
    res.json(topic);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch topic", details: err });
  }
};

// Update a topic
export const updateChatTopic = async (req: Request, res: Response) => {
  try {
    const { title } = req.body;
    const topic = await ChatTopicModel.findByIdAndUpdate(
      req.params.id,
      { title },
      { new: true, runValidators: true }
    );
    if (!topic) return res.status(404).json({ error: "Topic not found" });
    res.json(topic);
  } catch (err) {
    res.status(500).json({ error: "Failed to update topic", details: err });
  }
};

// Delete a topic
export const deleteChatTopic = async (req: Request, res: Response) => {
  try {
    const topic = await ChatTopicModel.findByIdAndDelete(req.params.id);
    if (!topic) return res.status(404).json({ error: "Topic not found" });
    res.json({ message: "Topic deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete topic", details: err });
  }
};
