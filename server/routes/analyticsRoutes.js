const express = require('express');
const { getDashboardMetrics } = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/analytics/dashboard - Get dashboard metrics
router.get('/dashboard', getDashboardMetrics);

module.exports = router;
