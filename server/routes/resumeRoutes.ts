import express from 'express';
import {
    uploadResume,
    getCandidatesForJob,
    getResumeStatus,
    exportCandidatesCsv,
    getRecruiterStats
} from '../controllers/resumeController';
import { protect } from '../middleware/authMiddleware';
import upload, { handleMulterError } from '../middleware/uploadMiddleware';
import { uploadLimiter, aiLimiter } from '../middleware/rateLimitMiddleware';
import validate from '../middleware/validationMiddleware';
import { resumeSchemas } from '../schemas';

const router = express.Router();

// Bulk file upload, field name in form-data should be 'resumeFiles'
router.post(
    '/upload',
    uploadLimiter,
    aiLimiter,
    protect,
    upload.array('resumeFiles', 10), // Support up to 10 files
    validate(resumeSchemas.upload),
    handleMulterError,
    uploadResume
);

// New route to get candidates for a specific job
router.get(
    '/job/:jobId/candidates',
    protect,
    getCandidatesForJob
);

// Route to get recruiter stats
router.get(
    '/stats',
    protect,
    getRecruiterStats
);

// Route to export candidates as CSV
router.get(
    '/job/:jobId/export',
    protect,
    exportCandidatesCsv
);

export default router;
