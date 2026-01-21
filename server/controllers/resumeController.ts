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

    const uploadedResumes: { resumeId: any; filename: string; }[] = [];
    const errors: { filename: string; error: string }[] = [];

    // Process each file
    for (const file of files) {
        try {
            // COMPREHENSIVE FILE VALIDATION
            const fileValidation = validateResumeFile(file);
            if (!fileValidation.isValid) {
                errors.push({ filename: file.originalname, error: fileValidation.error });
                logger.warn(`File validation failed for ${file.originalname}: ${fileValidation.error}`, {
                    filename: file.originalname,
                    error: fileValidation.error,
                    userId
                });
                continue; // Skip invalid files in bulk upload
            }

            const maliciousCheck = checkForMaliciousContent(file.buffer);
            if (!maliciousCheck.isValid) {
                errors.push({ filename: file.originalname, error: `Malicious content: ${maliciousCheck.error}` });
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
                errors.push({ filename: file.originalname, error: 'Text extraction failed or file format unsupported.' });
                logger.error(`Text extraction failed for ${file.originalname}`, {
                    filename: file.originalname,
                    error: extractionError.message
                });
                continue;
            }

            if (!extractedText || extractedText.trim() === '') {
                errors.push({ filename: file.originalname, error: 'No text content found in file.' });
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
            errors.push({ filename: file.originalname, error: `Unexpected processing error: ${err.message}` });
            logger.error(`Unexpected error processing ${file.originalname}`, { error: err.message });
        }
    }

    if (uploadedResumes.length === 0) {
        return res.status(400).json({
            message: 'All uploaded files failed validation or processing.',
            errors
        });
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

/**
 * @desc    Get recruitment statistics for the recruiter
 * @route   GET /api/resumes/stats
 * @access  Private
 */
export const getRecruiterStats = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const userId = req.user.id;

    // 1. Get Job Stats
    const totalJobs = await JobDescription.countDocuments({ userId });

    // 2. Get Resume Stats
    const resumes = await Resume.find({ userId });
    const totalResumes = resumes.length;

    const completedResumes = resumes.filter(r => r.processingStatus === 'completed');
    const averageScore = completedResumes.length > 0
        ? (completedResumes.reduce((acc, curr) => acc + (curr.score || 0), 0) / completedResumes.length).toFixed(1)
        : 0;

    // 3. Status Distribution
    const statusDistribution = {
        uploaded: resumes.filter(r => r.processingStatus === 'uploaded').length,
        processing: resumes.filter(r => r.processingStatus === 'processing' || r.processingStatus === 'extracting').length,
        completed: completedResumes.length,
        failed: resumes.filter(r => r.processingStatus === 'error').length,
    };

    // 4. Score Distribution (0-4, 5-7, 8-10)
    const scoreDistribution = {
        low: completedResumes.filter(r => (r.score || 0) < 5).length,
        mid: completedResumes.filter(r => (r.score || 0) >= 5 && (r.score || 0) < 8).length,
        high: completedResumes.filter(r => (r.score || 0) >= 8).length,
    };

    res.status(200).json({
        status: 'success',
        data: {
            totalJobs,
            totalResumes,
            averageScore: parseFloat(averageScore as string),
            statusDistribution,
            scoreDistribution
        }
    });
});

/**
 * @desc    Export candidates for a job as CSV
 * @route   GET /api/resumes/job/:jobId/export
 * @access  Private
 */
export const exportCandidatesCsv = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const { jobId } = req.params;
    const userId = req.user.id;

    // 1. Validate Job Ownership
    const job = await JobDescription.findById(jobId);
    if (!job) {
        return next(new AppError('Job not found.', 404));
    }
    if (job.userId.toString() !== userId) {
        return next(new AppError('You are not authorized to export candidates for this job.', 403));
    }

    // 2. Fetch All Processed Resumes for this Job
    const resumes = await Resume.find({
        jobId: jobId,
        processingStatus: 'completed',
    }).sort({ score: -1 });

    if (resumes.length === 0) {
        return next(new AppError('No processed candidates available for export.', 400));
    }

    // 3. Generate CSV content
    const header = ['Rank', 'Score', 'Filename', 'Years of Experience', 'Skills', 'Justification'];
    const rows = resumes.map((doc: any, index: number) => [
        index + 1,
        doc.score,
        `"${doc.originalFilename.replace(/"/g, '""')}"`,
        `"${(doc.geminiAnalysis?.yearsExperience || 'N/A').toString().replace(/"/g, '""')}"`,
        `"${(doc.geminiAnalysis?.skills || []).join(', ').replace(/"/g, '""')}"`,
        `"${(doc.geminiAnalysis?.justification || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [
        header.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    // 4. Send File
    const filename = `candidates_${job.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.status(200).send(csvContent);
});
