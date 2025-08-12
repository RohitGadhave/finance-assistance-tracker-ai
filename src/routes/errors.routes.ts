import express from "express";
import { getUserErrorLogs } from "../controllers/error-log.controller";

const router = express.Router();

// GET /error-logs/user/:userId
router.get("/:userId", getUserErrorLogs);

export default router;
