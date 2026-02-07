const express = require('express');
const { uploadResume, getCandidates, deleteCandidate, updateStatus, togglePin, bulkUpdateStatus } = require('../controllers/resumeController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// POST /api/resumes/upload - Upload and analyze resume
router.post('/upload', upload.single('resume'), uploadResume);

// GET /api/resumes/candidates/:jobId - Get all candidates for a job
router.get('/candidates/:jobId', getCandidates);

// DELETE /api/resumes/:id - Delete a candidate's resume
router.delete('/:id', deleteCandidate);

// PATCH /api/resumes/bulk-status - Bulk update candidate statuses
router.patch('/bulk-status', bulkUpdateStatus);

// PATCH /api/resumes/:id/status - Update candidate status
router.patch('/:id/status', updateStatus);

// PATCH /api/resumes/:id/pin - Toggle candidate pin
router.patch('/:id/pin', togglePin);

module.exports = router;
