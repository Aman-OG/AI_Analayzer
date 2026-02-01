const express = require('express');
const { uploadResume, getCandidates, deleteCandidate } = require('../controllers/resumeController');
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

module.exports = router;
