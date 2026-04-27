const express = require('express');
const { chatAboutCandidates } = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');
const { chatLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// POST /api/chat/:jobId - Chat with candidates
router.post('/:jobId', chatLimiter, chatAboutCandidates);

module.exports = router;
