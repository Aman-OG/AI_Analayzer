// server/routes/authRoutes.js
const express = require('express');
const { signupUser, loginUser, getUser, logoutUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); // We'll create this next
const { authLimiter } = require('../middleware/rateLimitMiddleware');

const router = express.Router();

// Apply strict rate limiting to auth endpoints to prevent brute force attacks
router.post('/signup', authLimiter, signupUser);
router.post('/login', authLimiter, loginUser);
router.get('/user', protect, getUser); // Protect this route
router.post('/logout', protect, logoutUser); // Protect this route

module.exports = router;