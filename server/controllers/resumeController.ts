import { Request, Response, NextFunction } from 'express';
import Resume from '../models/ResumeModel';
import JobDescription from '../models/JobDescriptionModel';
import { extractTextFromBuffer } from '../utils/resumeParser';
import { triggerGeminiAnalysis } from '../services/geminiService';
import { validateResumeFile, checkForMaliciousContent } from '../utils/fileValidator';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import logger from '../utils/logger';

/**
 * @desc    Upload resumes, extract text, and save metadata (Bulk support)
 * @route   POST /api/resumes/upload
 * @access  Private (requires authentication)
 */
export const uploadResume = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
        return next(new AppError('No files uploaded.', 400));
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

    const userId = req.user.id;
    const uploadedResumes = [];

    // Process each file
    for (const file of files) {
        try {
            // COMPREHENSIVE FILE VALIDATION
            const fileValidation = validateResumeFile(file);
            if (!fileValidation.isValid) {
                logger.warn(`File validation failed for ${file.originalname}: ${fileValidation.error}`, {
                    filename: file.originalname,
                    error: fileValidation.error,
                    userId
                });
                continue; // Skip invalid files in bulk upload
            }

            const maliciousCheck = checkForMaliciousContent(file.buffer);
            if (!maliciousCheck.isValid) {
                logger.error(`Malicious content detected in ${file.originalname} from user ${userId}`, {
                    filename: file.originalname,
                    error: maliciousCheck.error,
                    userId
                });
                continue;
            }

            // Extract text
            let extractedText: string;
            try {
                extractedText = await extractTextFromBuffer(file.buffer, file.mimetype);
            } catch (extractionError: any) {
                logger.error(`Text extraction failed for ${file.originalname}`, {
                    filename: file.originalname,
                    error: extractionError.message
                });
                continue;
            }

            if (!extractedText || extractedText.trim() === '') {
                logger.warn(`No text extracted from ${file.originalname}`);
                continue;
            }

            const newResume = new Resume({
                userId,
                jobId,
                originalFilename: file.originalname,
                fileType: file.mimetype,
                extractedText,
                processingStatus: 'uploaded',
            });

            await newResume.save();

            // Trigger Gemini Analysis Asynchronously
            triggerGeminiAnalysis((newResume._id as any).toString())
                .then(() => {
                    logger.info(`Gemini analysis for ${newResume._id} initiated successfully.`, { resumeId: newResume._id });
                })
                .catch(err => {
                    logger.error(`Failed to initiate Gemini analysis for ${newResume._id}`, {
                        resumeId: newResume._id,
                        error: err.message
                    });
                });

            uploadedResumes.push({
                resumeId: newResume._id,
                filename: file.originalname
            });

        } catch (err: any) {
            logger.error(`Unexpected error processing ${file.originalname}`, { error: err.message });
        }
    }

    if (uploadedResumes.length === 0) {
        return next(new AppError('All uploaded files failed validation or processing.', 400));
    }

    res.status(201).json({
        message: `${uploadedResumes.length} resume(s) uploaded and queued for analysis.`,
        data: uploadedResumes,
        // For backward compatibility or single file access
        resumeId: uploadedResumes[0].resumeId,
    });
});

/**
 * @desc    Get all candidates for a specific job with pagination
 * @route   GET /api/resumes/job/:jobId/candidates
 * @access  Private
 */
export const getCandidatesForJob = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const { jobId } = req.params;
    const userId = req.user.id;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
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
 */
export const getResumeStatus = catchAsync(async (req: any, res: Response, next: NextFunction) => {
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
