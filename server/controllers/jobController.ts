import { Request, Response, NextFunction } from 'express';
import JobDescription from '../models/JobDescriptionModel';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

/**
 * @desc    Create a new job description
 * @route   POST /api/jobs
 * @access  Private
 */
export const createJob = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const { title, descriptionText, mustHaveSkills, focusAreas } = req.body;
    const userId = req.user.id; // From authMiddleware

    const newJob = new JobDescription({
        userId,
        title,
        descriptionText,
        mustHaveSkills,
        focusAreas,
    });

    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
});

/**
 * @desc    Get all jobs for the authenticated user
 * @route   GET /api/jobs
 * @access  Private
 */
export const getJobs = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const jobs = await JobDescription.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(jobs);
});

/**
 * @desc    Get a single job description by ID
 * @route   GET /api/jobs/:id
 * @access  Private
 */
export const getJobById = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const job = await JobDescription.findById(req.params.id);

    if (!job) {
        return next(new AppError('Job description not found.', 404));
    }

    // Ensure user owns this job
    if (job.userId.toString() !== req.user.id) {
        return next(new AppError('You are not authorized to view this job description.', 403));
    }

    res.status(200).json(job);
});

/**
 * @desc    Update a job description
 * @route   PUT /api/jobs/:id
 * @access  Private
 */
export const updateJob = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const { title, descriptionText, mustHaveSkills, focusAreas } = req.body;
    let job = await JobDescription.findById(req.params.id);

    if (!job) {
        return next(new AppError('Job description not found.', 404));
    }

    if (job.userId.toString() !== req.user.id) {
        return next(new AppError('You are not authorized to update this job.', 403));
    }

    job.title = title || job.title;
    job.descriptionText = descriptionText || job.descriptionText;
    job.mustHaveSkills = mustHaveSkills || job.mustHaveSkills;
    job.focusAreas = focusAreas || job.focusAreas;

    const updatedJob = await job.save();
    res.status(200).json(updatedJob);
});

/**
 * @desc    Delete a job description
 * @route   DELETE /api/jobs/:id
 * @access  Private
 */
export const deleteJob = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const job = await JobDescription.findById(req.params.id);

    if (!job) {
        return next(new AppError('Job description not found.', 404));
    }

    if (job.userId.toString() !== req.user.id) {
        return next(new AppError('You are not authorized to delete this job.', 403));
    }

    await job.deleteOne();
    res.status(200).json({ message: 'Job description deleted successfully.' });
});
