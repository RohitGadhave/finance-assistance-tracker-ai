import { Router } from "express";
import monitorRoutes from "./monitor.routes";
const router = Router();
router.use("/monitor", monitorRoutes);
//router.use('/products', productRoutes); ← example for more routes
export default router;
export { router as apiRouter };
