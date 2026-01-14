import express from 'express';
import { signupUser, loginUser, getUser, logoutUser, refreshToken } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import { authLimiter } from '../middleware/rateLimitMiddleware';
import validate from '../middleware/validationMiddleware';
import { authSchemas } from '../schemas';

const router = express.Router();

// Apply strict rate limiting to auth endpoints to prevent brute force attacks
router.post('/signup', authLimiter, validate(authSchemas.signup), signupUser);
router.post('/login', authLimiter, validate(authSchemas.login), loginUser);
router.post('/refresh', authLimiter, refreshToken);
router.get('/user', protect, getUser); // Protect this route
router.post('/logout', protect, logoutUser); // Protect this route

export default router;
