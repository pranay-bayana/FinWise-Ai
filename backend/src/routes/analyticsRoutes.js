// src/routes/analyticsRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  generateAndStoreInsights,
  getDashboard,
  getHealthScore,
  getInsights,
  getTrends,
} from '../controllers/analyticsController.js';

const router = express.Router();
router.use(protect);

router.get('/dashboard', getDashboard);
router.get('/trends', getTrends);
router.get('/insights', getInsights);
router.post('/insights/generate', generateAndStoreInsights);
router.get('/health-score', getHealthScore);

export default router;

