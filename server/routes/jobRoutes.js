const express = require('express');
const {
    getAllJobs,
    getJobById,
    createJob,
    updateJob,
    deleteJob,
} = require('../controllers/jobController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/jobs - Get all jobs
router.get('/', getAllJobs);

// POST /api/jobs - Create new job
router.post('/', createJob);

// GET /api/jobs/:id - Get single job
router.get('/:id', getJobById);

// PUT /api/jobs/:id - Update job
router.put('/:id', updateJob);

// DELETE /api/jobs/:id - Delete job
router.delete('/:id', deleteJob);

module.exports = router;
