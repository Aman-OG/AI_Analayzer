// server/routes/authRoutes.js
const express = require('express');
const { signupUser, loginUser, getUser, logoutUser, refreshToken } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimitMiddleware');
const validate = require('../middleware/validationMiddleware');
const { authSchemas } = require('../schemas');

const router = express.Router();

// Apply strict rate limiting to auth endpoints to prevent brute force attacks
router.post('/signup', authLimiter, validate(authSchemas.signup), signupUser);
router.post('/login', authLimiter, validate(authSchemas.login), loginUser);
router.post('/refresh', authLimiter, refreshToken);
router.get('/user', protect, getUser); // Protect this route
router.post('/logout', protect, logoutUser); // Protect this route

module.exports = router;