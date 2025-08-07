import { Router } from 'express';

const router = Router();

router.get('/ping', (req, res) => {
  res.json({ message: 'All Good 🚀' });
});

export default router;
export { router as indexRouter };