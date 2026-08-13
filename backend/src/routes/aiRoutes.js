// src/routes/aiRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getMonthlyAIReport, chatWithAI } from '../controllers/aiController.js';

const router = express.Router();
router.use(protect);

router.get('/monthly-report', getMonthlyAIReport);
router.post('/chat', chatWithAI);

export default router;

