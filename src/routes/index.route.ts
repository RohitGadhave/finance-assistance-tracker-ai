import { Router } from "express";
import monitorRoutes from "./monitor.routes";
import chatRoutes from "./ai-chat.routes";
import topicsRoutes from "./chat-topic.routes";
import userRoutes from "./user.routes";
import errorRoutes from "./errors.routes";
import transactionRoutes from "./transaction.routes";
const router = Router();
router.use("/monitor", monitorRoutes);
router.use("/chat", chatRoutes);
router.use("/topics", topicsRoutes);
router.use("/user", userRoutes);
router.use("/transactions", transactionRoutes);
router.use("/error", errorRoutes);
//router.use('/products', productRoutes); ← example for more routes
export default router;
export { router as apiRouter };
