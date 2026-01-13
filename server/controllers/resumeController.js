const Resume = require('../models/ResumeModel');
const JobDescription = require('../models/JobDescriptionModel');
const { extractTextFromBuffer } = require('../utils/resumeParser');
const { triggerGeminiAnalysis } = require('../services/geminiService');
const { validateResumeFile, checkForMaliciousContent } = require('../utils/fileValidator');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const logger = require('../utils/logger');

// @desc    Upload a resume, extract text, and save metadata
// @route   POST /api/resumes/upload
// @access  Private (requires authentication)
const uploadResume = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('No file uploaded.', 400));
  }

  const { jobId } = req.body;

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
  const fileBuffer = req.file.buffer;
  const mimeType = req.file.mimetype;
  const originalFilename = req.file.originalname;

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

// @desc    Get processed candidates for a specific job
// @route   GET /api/resumes/job/:jobId/candidates
// @access  Private (user must own the job)
const getCandidatesForJob = catchAsync(async (req, res, next) => {
  const { jobId } = req.params;
  const userId = req.user.id;

  // 1. Validate Job Ownership
  const job = await JobDescription.findById(jobId);
  if (!job) {
    return next(new AppError('Job not found.', 404));
  }
  if (job.userId.toString() !== userId) {
    return next(new AppError('You are not authorized to view candidates for this job.', 403));
  }

  // 2. Fetch Processed Resumes for this Job
  const candidates = await Resume.find({
    jobId: jobId,
    processingStatus: 'completed',
  })
    .sort({ score: -1 })
    .select('_id originalFilename uploadTimestamp score geminiAnalysis.skills geminiAnalysis.yearsExperience geminiAnalysis.education geminiAnalysis.justification geminiAnalysis.warnings processingStatus fileType')
    .lean();

  if (!candidates || candidates.length === 0) {
    return res.status(200).json([]);
  }

  // 3. Calculate Top Performers
  const numToFlag = Math.max(1, Math.ceil(candidates.length * 0.20));

  const processedCandidates = candidates.map((candidate, index) => {
    return {
      candidateId: candidate._id,
      originalFilename: candidate.originalFilename,
      fileType: candidate.fileType,
      uploadTimestamp: candidate.uploadTimestamp,
      score: candidate.score,
      skills: candidate.geminiAnalysis?.skills || [],
      yearsExperience: candidate.geminiAnalysis?.yearsExperience || null,
      education: candidate.geminiAnalysis?.education || [],
      justification: candidate.geminiAnalysis?.justification || "No justification provided.",
      warnings: candidate.geminiAnalysis?.warnings || [],
      isFlagged: index < numToFlag,
    };
  });

  res.status(200).json(processedCandidates);
});

// @desc    Get status of a specific resume
// @route   GET /api/resumes/:resumeId/status
// @access  Private
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
    resumeId: resume._id,
    processingStatus: resume.processingStatus,
    errorDetails: resume.errorDetails,
    score: resume.score,
    originalFilename: resume.originalFilename,
  });
});

module.exports = {
  uploadResume,
  getCandidatesForJob,
  getResumeStatus,
};


module.exports = {
  uploadResume,
  getCandidatesForJob,
  getResumeStatus,
  // other resume controllers if any
};
