import express from 'express';
import {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob,
} from '../controllers/jobController';
import { protect } from '../middleware/authMiddleware';
import { jobLimiter } from '../middleware/rateLimitMiddleware';
import validate from '../middleware/validationMiddleware';
import { jobSchemas } from '../schemas';

const router = express.Router();

router.route('/')
    .post(protect, jobLimiter, validate(jobSchemas.create), createJob)
    .get(protect, getJobs);

router.route('/:id')
    .get(protect, getJobById)
    .put(protect, validate(jobSchemas.update), updateJob)
    .delete(protect, deleteJob);

export default router;
