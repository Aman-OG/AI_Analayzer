// server/middleware/rateLimitMiddleware.js
const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for authentication endpoints (login, signup)
 * Prevents brute force attacks
 * 5 requests per 15 minutes per IP
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts from this IP, please try again after 15 minutes.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip successful requests (optional - only count failed login attempts)
  skipSuccessfulRequests: false,
  // Skip failed requests (optional)
  skipFailedRequests: false,
});

/**
 * Rate limiter for resume upload endpoints
 * Prevents abuse of AI analysis and file storage
 * 10 uploads per hour per IP
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 uploads per hour
  message: {
    error: 'Too many resume uploads from this IP, please try again after an hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // You can also use a custom key generator to limit per user instead of IP
  // keyGenerator: (req) => req.user?.id || req.ip,
});

/**
 * Rate limiter for job creation endpoints
 * Prevents spam job postings
 * 20 job creations per hour per IP
 */
const jobLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 job creations per hour
  message: {
    error: 'Too many job creation requests from this IP, please try again after an hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General API rate limiter
 * Applied to all API routes as a baseline protection
 * 100 requests per 15 minutes per IP
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100, // Configurable via env
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict limiter for sensitive operations
 * Can be used for password reset, email verification, etc.
 * 3 requests per hour per IP
 */
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    error: 'Too many requests for this sensitive operation, please try again after an hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Limit for AI-intensive analysis
 * 15 requests per 30 minutes
 */
const aiLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 15,
  message: {
    error: 'AI analysis limit reached. Please try again after 30 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authLimiter,
  uploadLimiter,
  jobLimiter,
  generalLimiter,
  strictLimiter,
  aiLimiter,
};
