// server/server.js
console.log('DEBUG: Starting server.js');
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
console.log('DEBUG: Requiring config modules');
const connectDB = require('./config/db');
const { initSupabase } = require('./config/supabaseClient');
const { initGemini } = require('./config/gemini');
console.log('DEBUG: Config modules required');

// Security middleware
const {
  helmetConfig,
  mongoSanitizeConfig,
  sanitizeResponseHeaders,
  preventApiKeyLeakage,
} = require('./middleware/securityMiddleware');
const { generalLimiter } = require('./middleware/rateLimitMiddleware');

// Load environment variables
dotenv.config();

// Initialize Database Connection
connectDB();

// Initialize Supabase (optional here, depends if needed globally immediately)
initSupabase();

// Initialize Gemini (optional here, if needed globally)
initGemini();

const app = express();

// --- Static Documentation ---
app.use('/api-docs', express.static(path.join(__dirname, 'docs')));
app.get('/api-docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'index.html'));
});

// Security Middleware - Apply these FIRST
app.use(helmetConfig); // Helmet for security headers
app.use(sanitizeResponseHeaders); // Remove sensitive headers

// CORS Configuration - More restrictive than wildcard
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5173']; // Default for development

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' })); // Parse JSON request bodies with size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB sanitization - Prevent NoSQL injection
app.use(mongoSanitizeConfig);

// API key leakage prevention
app.use(preventApiKeyLeakage);

// Apply general rate limiting to all API routes
app.use('/api', generalLimiter);

// Basic Test Route
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the Resume Analyzer API!' });
});

// --- Authentication Routes (We'll add these soon) ---
const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes'); // Add this
const jobRoutes = require('./routes/jobRoutes'); // Add this


app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes); // Add this line
app.use('/api/jobs', jobRoutes); // Add this line

// --- Unhandled Routes ---
const AppError = require('./utils/appError');
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// --- Global Error Handling Middleware ---
const errorHandler = require('./middleware/errorMiddleware');
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

const logger = require('./utils/logger');
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});