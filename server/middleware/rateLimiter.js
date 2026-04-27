const rateLimit = require('express-rate-limit');

// General API limiter: 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes',
    },
});

// Upload limiter: 20 requests per 15 minutes per user
const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 uploads per user per 15 minutes
    keyGenerator: (req) => req.user ? req.user.id : req.ip, // Key by user ID if available, fallback to IP
    message: {
        success: false,
        message: 'You have reached the upload limit of 20 resumes per 15 minutes. Please wait before uploading more.',
    },
});

// AI generation limiter: 10 interview guide requests per hour per user
const aiGenerateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    keyGenerator: (req) => req.user ? req.user.id : req.ip,
    message: {
        success: false,
        message: 'You have reached the limit of 10 AI generations per hour. Please try again later.',
    },
});

// Chat limiter: 30 messages per hour per user
const chatLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 30,
    keyGenerator: (req) => req.user ? req.user.id : req.ip,
    message: {
        success: false,
        message: 'You have reached the chat limit of 30 messages per hour. Please try again later.',
    },
});

module.exports = {
    generalLimiter,
    uploadLimiter,
    aiGenerateLimiter,
    chatLimiter
};
