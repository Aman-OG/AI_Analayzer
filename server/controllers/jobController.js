const JobDescription = require('../models/JobDescriptionModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

/**
 * @desc    Create a new job description
 * @route   POST /api/jobs
 * @access  Private
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const createJob = catchAsync(async (req, res, next) => {
  const { title, descriptionText, mustHaveSkills, focusAreas } = req.body;
  const userId = req.user.id; // From authMiddleware

  if (!title || !descriptionText) {
    return next(new AppError('Title and description text are required.', 400));
  }

  const newJob = new JobDescription({
    userId,
    title,
    descriptionText,
    mustHaveSkills: mustHaveSkills || [],
    focusAreas: focusAreas || [],
  });

  const savedJob = await newJob.save();
  res.status(201).json(savedJob);
});

/**
 * @desc    Get all jobs for the authenticated user
 * @route   GET /api/jobs
 * @access  Private
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const getJobs = catchAsync(async (req, res, next) => {
  const jobs = await JobDescription.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.status(200).json(jobs);
});

// @access  Private (ensure user owns this job)
const getJobById = catchAsync(async (req, res, next) => {
  const job = await JobDescription.findById(req.params.id);

  if (!job) {
    return next(new AppError('Job not found.', 404));
  }

  // Ensure the logged-in user owns this job description
  if (job.userId.toString() !== req.user.id) {
    return next(new AppError('User not authorized to access this job.', 403));
  }

  res.status(200).json(job);
});

// @desc    Update a job description
// @route   PUT /api/jobs/:id
// @access  Private
/**
 * @desc    Update a job description
 * @route   PUT /api/jobs/:id
 * @access  Private
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const updateJob = catchAsync(async (req, res, next) => {
  const { title, descriptionText, mustHaveSkills, focusAreas } = req.body;
  let job = await JobDescription.findById(req.params.id);

  if (!job) {
    return next(new AppError('Job not found.', 404));
  }

  if (job.userId.toString() !== req.user.id) {
    return next(new AppError('User not authorized to update this job.', 403));
  }

  job.title = title || job.title;
  job.descriptionText = descriptionText || job.descriptionText;
  job.mustHaveSkills = mustHaveSkills !== undefined ? mustHaveSkills : job.mustHaveSkills;
  job.focusAreas = focusAreas !== undefined ? focusAreas : job.focusAreas;

  const updatedJob = await job.save();
  res.status(200).json(updatedJob);
});

// @desc    Delete a job description
// @route   DELETE /api/jobs/:id
// @access  Private
/**
 * @desc    Delete a job description
 * @route   DELETE /api/jobs/:id
 * @access  Private
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const deleteJob = catchAsync(async (req, res, next) => {
  const job = await JobDescription.findById(req.params.id);

  if (!job) {
    return next(new AppError('Job not found.', 404));
  }

  if (job.userId.toString() !== req.user.id) {
    return next(new AppError('User not authorized to delete this job.', 403));
  }

  await job.deleteOne();

  res.status(200).json({ message: 'Job description deleted successfully.' });
});

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
};