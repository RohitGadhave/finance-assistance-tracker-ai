import { Router } from "express";
import monitorRoutes from "./monitor.routes";
import chatRoutes from "./ai-chat.routes";
const router = Router();
router.use("/monitor", monitorRoutes);
router.use("/chat", chatRoutes);
//router.use('/products', productRoutes); ← example for more routes
export default router;
export { router as apiRouter };
