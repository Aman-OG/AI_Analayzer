import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import connectDB from './config/db';
import { initSupabase } from './config/supabaseClient';
import { initGemini } from './config/gemini';

// Security middleware
import {
    helmetConfig,
    mongoSanitizeConfig,
    sanitizeResponseHeaders,
    preventApiKeyLeakage,
} from './middleware/securityMiddleware';
import { generalLimiter } from './middleware/rateLimitMiddleware';

// Routes
import authRoutes from './routes/authRoutes';
import resumeRoutes from './routes/resumeRoutes';
import jobRoutes from './routes/jobRoutes';

// Utils & Middleware
import AppError from './utils/appError';
import errorHandler from './middleware/errorMiddleware';
import logger from './utils/logger';

// Load environment variables
dotenv.config();

// Initialize Database Connection
connectDB();
initSupabase();
initGemini();

const app = express();

// --- Static Documentation ---
app.use('/api-docs', express.static(path.join(__dirname, 'docs')));
app.get('/api-docs', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'docs', 'index.html'));
});

// Security Middleware
app.use(helmetConfig);
app.use(sanitizeResponseHeaders);

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:5173'];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) === -1) {
                const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
                return callback(new Error(msg), false);
            }
            return callback(null, true);
        },
        credentials: true,
    })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB sanitization
// app.use(mongoSanitizeConfig);
app.use(preventApiKeyLeakage);

// Apply general rate limiting
app.use('/api', generalLimiter);

// Basic Test Route
app.get('/api', (req: Request, res: Response) => {
    res.json({ message: 'Welcome to the Resume Analyzer API!' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/jobs', jobRoutes);

// Unhandled Routes
app.use((req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});
