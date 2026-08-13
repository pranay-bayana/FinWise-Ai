const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

router.get('/dashboard', auth, analyticsController.getDashboardAnalytics);
router.get('/trends', auth, analyticsController.getMonthlyTrends);
router.get('/insights', auth, analyticsController.getAIInsights);
router.post('/insights/generate', auth, analyticsController.generateAIInsights);
router.get('/health-score', auth, analyticsController.getFinancialHealthScore);

module.exports = router;
