// server/routes/jobRoutes.js
const express = require('express');
const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');
const { jobLimiter } = require('../middleware/rateLimitMiddleware');
const validate = require('../middleware/validationMiddleware');
const { jobSchemas } = require('../schemas');

const router = express.Router();

router.route('/')
  .post(protect, jobLimiter, validate(jobSchemas.create), createJob) // Rate limit and validate 
  .get(protect, getJobs);

router.route('/:id')
  .get(protect, getJobById)
  .put(protect, validate(jobSchemas.update), updateJob)
  .delete(protect, deleteJob);

module.exports = router;