const Resume = require('../models/ResumeModel');
const JobDescription = require('../models/JobDescriptionModel');
const { extractTextFromBuffer } = require('../utils/resumeParser');
const { triggerGeminiAnalysis } = require('../services/geminiService');
const { validateResumeFile, checkForMaliciousContent } = require('../utils/fileValidator');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const logger = require('../utils/logger');

/**
 * @desc    Upload a resume, extract text, and save metadata
 * @route   POST /api/resumes/upload
 * @access  Private (requires authentication)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const uploadResume = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('No file uploaded.', 400));
  }

  const { jobId } = req.body;
  const fileBuffer = req.file.buffer;
  const originalFilename = req.file.originalname;
  const mimeType = req.file.mimetype;

  if (!jobId) {
    return next(new AppError('Job ID is required.', 400));
  }

  // Validate if jobId exists and belongs to the user
  const jobExists = await JobDescription.findOne({ _id: jobId, userId: req.user.id });
  if (!jobExists) {
    return next(new AppError('Job description not found or you are not authorized for this job.', 404));
  }

  // COMPREHENSIVE FILE VALIDATION
  const fileValidation = validateResumeFile(req.file);
  if (!fileValidation.isValid) {
    logger.warn(`File validation failed for ${req.file.originalname}: ${fileValidation.error}`, {
      filename: req.file.originalname,
      error: fileValidation.error,
      userId: req.user.id
    });
    return next(new AppError(fileValidation.error, 400));
  }

  const maliciousCheck = checkForMaliciousContent(req.file.buffer);
  if (!maliciousCheck.isValid) {
    logger.error(`Malicious content detected in ${req.file.originalname} from user ${req.user.id}`, {
      filename: req.file.originalname,
      error: maliciousCheck.error,
      userId: req.user.id
    });
    return next(new AppError(maliciousCheck.error, 400));
  }

  const userId = req.user.id;

  // Extract text from validated file
  let extractedText;
  try {
    extractedText = await extractTextFromBuffer(fileBuffer, mimeType);
  } catch (extractionError) {
    logger.error(`Text extraction failed for ${originalFilename}`, {
      filename: originalFilename,
      error: extractionError.message,
      stack: extractionError.stack
    });
    return next(new AppError(`Failed to extract text from file: ${extractionError.message}`, 500));
  }

  if (!extractedText || extractedText.trim() === '') {
    return next(new AppError('Could not extract any text from the resume or the resume is empty.', 400));
  }

  const newResume = new Resume({
    userId,
    jobId,
    originalFilename,
    fileType: mimeType,
    extractedText,
    processingStatus: 'uploaded',
  });

  await newResume.save();

  // Trigger Gemini Analysis Asynchronously
  triggerGeminiAnalysis(newResume._id)
    .then(() => {
      logger.info(`Gemini analysis for ${newResume._id} initiated successfully.`, { resumeId: newResume._id });
    })
    .catch(err => {
      logger.error(`Failed to initiate Gemini analysis for ${newResume._id}`, {
        resumeId: newResume._id,
        error: err.message,
        stack: err.stack
      });
    });

  res.status(201).json({
    message: 'Resume uploaded and text extracted. Analysis has been queued.',
    resumeId: newResume._id,
  });
});

/**
 * @desc    Get all candidates for a specific job with pagination
 * @route   GET /api/resumes/job/:jobId/candidates
 * @access  Private
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const getCandidatesForJob = catchAsync(async (req, res, next) => {
  const { jobId } = req.params;
  const userId = req.user.id;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // 1. Validate Job Ownership
  const job = await JobDescription.findById(jobId);
  if (!job) {
    return next(new AppError('Job not found.', 404));
  }
  if (job.userId.toString() !== userId) {
    return next(new AppError('You are not authorized to view candidates for this job.', 403));
  }

  // 2. Fetch Processed Resumes for this Job with pagination
  const resumes = await Resume.find({
    jobId: jobId,
    processingStatus: 'completed',
  })
    .sort({ score: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Resume.countDocuments({
    jobId: jobId,
    processingStatus: 'completed',
  });

  // Map to a more friendly "Candidate" structure for the frontend
  const candidates = resumes.map(doc => ({
    candidateId: doc._id,
    originalFilename: doc.originalFilename,
    fileType: doc.fileType,
    uploadTimestamp: doc.createdAt,
    score: doc.score,
    skills: doc.geminiAnalysis?.skills || [],
    yearsExperience: doc.geminiAnalysis?.yearsExperience || null,
    education: doc.geminiAnalysis?.education || [],
    justification: doc.geminiAnalysis?.justification || '',
    warnings: doc.geminiAnalysis?.warnings || [],
    isFlagged: (doc.geminiAnalysis?.warnings?.length || 0) > 0
  }));

  res.status(200).json({
    status: 'success',
    results: candidates.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: candidates
  });
});

/**
 * @desc    Get the status of a specific resume analysis
 * @route   GET /api/resumes/:resumeId/status
 * @access  Private
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const getResumeStatus = catchAsync(async (req, res, next) => {
  const { resumeId } = req.params;
  const userId = req.user.id;

  const resume = await Resume.findById(resumeId);
  if (!resume) {
    return next(new AppError('Resume not found.', 404));
  }

  if (resume.userId.toString() !== userId) {
    return next(new AppError('You are not authorized to view this resume.', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      resumeId: resume._id,
      processingStatus: resume.processingStatus,
      errorDetails: resume.errorDetails,
      score: resume.score,
      originalFilename: resume.originalFilename,
      updatedAt: resume.updatedAt
    }
  });
});

module.exports = {
  uploadResume,
  getCandidatesForJob,
  getResumeStatus,
};
