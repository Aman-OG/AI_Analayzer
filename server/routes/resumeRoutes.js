// server/routes/resumeRoutes.js
const express = require('express');
const {
    uploadResume,
    getCandidatesForJob,
    getResumeStatus
} = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Multer instance
const { handleMulterError } = require('../middleware/uploadMiddleware');
const { uploadLimiter } = require('../middleware/rateLimitMiddleware');

const router = express.Router();

// Single file upload, field name in form-data should be 'resumeFile'
// Apply rate limiting to prevent abuse of AI analysis and storage
router.post(
    '/upload',
    uploadLimiter, // Rate limit uploads
    protect, // Ensure user is authenticated
    upload.single('resumeFile'), // Multer middleware for single file
    handleMulterError, // Handle multer-specific errors
    uploadResume
);


// New route to get candidates for a specific job
router.get(
    '/job/:jobId/candidates',
    protect,
    getCandidatesForJob
);

// Route to check status of a specific resume
router.get(
    '/:resumeId/status',
    protect,
    getResumeStatus
);

module.exports = router;

