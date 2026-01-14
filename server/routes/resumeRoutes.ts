import express from 'express';
import {
    uploadResume,
    getCandidatesForJob,
    getResumeStatus
} from '../controllers/resumeController';
import { protect } from '../middleware/authMiddleware';
import upload, { handleMulterError } from '../middleware/uploadMiddleware';
import { uploadLimiter, aiLimiter } from '../middleware/rateLimitMiddleware';
import validate from '../middleware/validationMiddleware';
import { resumeSchemas } from '../schemas';

const router = express.Router();

// Single file upload, field name in form-data should be 'resumeFile'
router.post(
    '/upload',
    uploadLimiter,
    aiLimiter,
    protect,
    upload.single('resumeFile'),
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

// Route to check status of a specific resume
router.get(
    '/:resumeId/status',
    protect,
    getResumeStatus
);

export default router;
