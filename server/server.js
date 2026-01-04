// server/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db'); // We'll create this next
const { initSupabase } = require('./config/supabaseClient'); // We'll create this
const { initGemini } = require('./config/gemini'); // We'll create this

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

// --- Other Routes (will be added later) ---
// app.use('/api/jobs', jobRoutes);
// app.use('/api/resumes', resumeRoutes);


const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});