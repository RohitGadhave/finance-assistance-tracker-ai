import { Router } from "express";
import monitorRoutes from "./monitor.routes";
import chatRoutes from "./ai-chat.routes";
import userRoutes from "./user.routes";
import errorRoutes from "./errors.routes";
const router = Router();
router.use("/monitor", monitorRoutes);
router.use("/chat", chatRoutes);
router.use("/user", userRoutes);
router.use("/error", errorRoutes);
//router.use('/products', productRoutes); ← example for more routes
export default router;
export { router as apiRouter };
