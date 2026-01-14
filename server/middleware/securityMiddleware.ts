import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import logger from '../utils/logger';

/**
 * Configure Helmet.js for security headers
 */
export const helmetConfig = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    },
    frameguard: {
        action: 'deny',
    },
    noSniff: true,
    referrerPolicy: {
        policy: 'strict-origin-when-cross-origin',
    },
});

/**
 * MongoDB sanitization middleware
 */
export const mongoSanitizeConfig = mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
        logger.warn(`[Security] Sanitized request from ${req.ip}: removed key "${key}"`);
    },
});

/**
 * Additional security middleware for API key protection
 */
export const sanitizeResponseHeaders = (req: Request, res: Response, next: NextFunction) => {
    res.removeHeader('X-Powered-By');
    res.setHeader('X-API-Version', '1.0');
    next();
};

/**
 * Middleware to validate that API keys are not being sent from client
 */
export const preventApiKeyLeakage = (req: Request, res: Response, next: NextFunction) => {
    const sensitiveFields = ['GEMINI_API_KEY', 'geminiApiKey', 'apiKey', 'api_key'];

    if (req.body) {
        for (const field of sensitiveFields) {
            if (req.body[field]) {
                logger.error(`[Security Alert] Attempt to send API key from client: ${req.ip}`);
                return res.status(400).json({
                    error: 'Invalid request: API keys should not be sent from client.',
                });
            }
        }
    }

    next();
};
