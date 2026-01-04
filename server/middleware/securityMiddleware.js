// server/middleware/securityMiddleware.js
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

/**
 * Configure Helmet.js for security headers
 * Helmet helps secure Express apps by setting various HTTP headers
 */
const helmetConfig = helmet({
    // Content Security Policy
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for development
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    // Strict-Transport-Security header (HSTS)
    hsts: {
        maxAge: 31536000, // 1 year in seconds
        includeSubDomains: true,
        preload: true,
    },
    // X-Frame-Options header to prevent clickjacking
    frameguard: {
        action: 'deny',
    },
    // X-Content-Type-Options header to prevent MIME sniffing
    noSniff: true,
    // X-XSS-Protection header
    xssFilter: true,
    // Referrer-Policy header
    referrerPolicy: {
        policy: 'strict-origin-when-cross-origin',
    },
});

/**
 * MongoDB sanitization middleware
 * Prevents MongoDB operator injection attacks
 * Removes any keys that start with '$' or contain '.'
 */
const mongoSanitizeConfig = mongoSanitize({
    replaceWith: '_', // Replace prohibited characters with underscore
    onSanitize: ({ req, key }) => {
        console.warn(`[Security] Sanitized request from ${req.ip}: removed key "${key}"`);
    },
});

/**
 * Additional security middleware for API key protection
 * Ensures sensitive headers are not leaked in responses
 */
const sanitizeResponseHeaders = (req, res, next) => {
    // Remove sensitive headers from responses
    res.removeHeader('X-Powered-By');

    // Add custom security headers
    res.setHeader('X-API-Version', '1.0');

    next();
};

/**
 * Middleware to validate that API keys are not being sent from client
 * This is a safety check to ensure no API keys leak to the frontend
 */
const preventApiKeyLeakage = (req, res, next) => {
    // Check if request body contains any API key fields (shouldn't happen from client)
    const sensitiveFields = ['GEMINI_API_KEY', 'geminiApiKey', 'apiKey', 'api_key'];

    if (req.body) {
        for (const field of sensitiveFields) {
            if (req.body[field]) {
                console.error(`[Security Alert] Attempt to send API key from client: ${req.ip}`);
                return res.status(400).json({
                    error: 'Invalid request: API keys should not be sent from client.',
                });
            }
        }
    }

    next();
};

module.exports = {
    helmetConfig,
    mongoSanitizeConfig,
    sanitizeResponseHeaders,
    preventApiKeyLeakage,
};
