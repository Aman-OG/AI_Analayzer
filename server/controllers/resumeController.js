const Resume = require('../models/ResumeModel');
const JobDescription = require('../models/JobDescriptionModel');
const supabase = require('../config/supabaseClient');
const { parseResume } = require('../utils/resumeParser');
const { triggerGroqAnalysis } = require('../services/groqService');
const crypto = require('crypto');

/**
 * Upload and analyze resume
 * POST /api/resumes/upload
 */
const uploadResume = async (req, res) => {
    try {
        const { jobId } = req.body;
        const userId = req.user.id;
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
            });
        }

        if (!jobId) {
            return res.status(400).json({
                success: false,
                message: 'Job ID is required',
            });
        }

        // Verify job exists and belongs to user
        const job = await JobDescription.findOne({ _id: jobId, userId });
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found',
            });
        }

        // Check for duplicate resume (same filename for the same job and user)
        const duplicate = await Resume.findOne({
            jobId,
            userId,
            originalFilename: file.originalname
        });

        if (duplicate) {
            return res.status(400).json({
                success: false,
                message: `The resume '${file.originalname}' has already been uploaded for this position.`,
            });
        }

        // Determine file type
        const fileType = file.mimetype === 'application/pdf' ? 'pdf' : 'docx';

        // Calculate file hash for uniqueness optimization
        const fileHash = crypto.createHash('md5').update(file.buffer).digest('hex');

        // Check if this job already has a completed analysis with the same hash
        const existingHashResume = await Resume.findOne({
            jobId,
            fileHash,
            processingStatus: 'completed'
        });

        if (existingHashResume) {
            console.log(`✨ Hash match found! Reusing analysis for file: ${file.originalname}`);

            // Still upload to supabase for visibility, but link to existing results
            const fileName = `${userId}/${jobId}/${Date.now()}_${file.originalname}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('resumes')
                .upload(fileName, file.buffer, { contentType: file.mimetype });

            if (!uploadError) {
                const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(fileName);

                const resume = await Resume.create({
                    jobId,
                    userId,
                    originalFilename: file.originalname,
                    fileType,
                    fileHash,
                    supabaseFileUrl: urlData.publicUrl,
                    extractedText: existingHashResume.extractedText,
                    processingStatus: 'completed',
                    score: existingHashResume.score,
                    geminiAnalysis: existingHashResume.geminiAnalysis
                });

                return res.status(201).json({
                    success: true,
                    message: 'Resume detected as duplicate (content). Analysis reused instantly.',
                    resumeId: resume._id,
                });
            }
        }

        // Extract text from file - with granular status
        let extractedText;
        try {
            // We create the resume entry first to show 'parsing' status if possible, 
            // but usually we want to parse before DB if we might fail.
            // Let's parse first.
            extractedText = await parseResume(file.buffer, fileType);
        } catch (parseError) {
            return res.status(400).json({
                success: false,
                message: `File parsing failed: ${parseError.message}`,
            });
        }

        if (!extractedText || extractedText.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No text could be extracted from the file',
            });
        }

        // Upload file to Supabase Storage
        const fileName = `${userId}/${jobId}/${Date.now()}_${file.originalname}`;
        console.log(`📤 Uploading to Supabase: ${fileName}`);

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('resumes')
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: false,
            });

        if (uploadError) {
            console.error('❌ Supabase upload error:', uploadError);
            return res.status(500).json({
                success: false,
                message: `File upload failed: ${uploadError.message}`,
            });
        }
        console.log('✅ Supabase upload success:', uploadData.path);

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('resumes')
            .getPublicUrl(fileName);

        // Save resume to database with 'processing' status
        const resume = await Resume.create({
            jobId,
            userId,
            originalFilename: file.originalname,
            fileType,
            fileHash,
            supabaseFileUrl: urlData.publicUrl,
            extractedText,
            processingStatus: 'processing',
        });

        // Trigger async analysis (don't wait for it)
        triggerGroqAnalysis(resume._id.toString()).catch(err => {
            console.error('Background analysis trigger error:', err);
        });

        res.status(201).json({
            success: true,
            message: 'Resume uploaded successfully. Analysis in progress.',
            resumeId: resume._id,
        });

    } catch (error) {
        console.error('Upload resume error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading resume',
        });
    }
};

/**
 * Get all candidates for a job
 * GET /api/resumes/candidates/:jobId
 */
const getCandidates = async (req, res) => {
    try {
        const { jobId } = req.params;
        const userId = req.user.id;

        // Verify job exists and belongs to user
        const job = await JobDescription.findOne({ _id: jobId, userId });
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found',
            });
        }

        // Get ALL resumes for this job (not just completed)
        const resumes = await Resume.find({ jobId })
            .select('-extractedText -__v') // Exclude large text field
            .sort({ score: -1, uploadTimestamp: -1 });

        // Calculate top 20% from completed resumes only
        const completedResumes = resumes.filter(r => r.processingStatus === 'completed');
        const top20PercentCount = Math.ceil(completedResumes.length * 0.2);
        const topScores = completedResumes
            .map(r => r.score)
            .sort((a, b) => b - a)
            .slice(0, top20PercentCount);
        const minTopScore = topScores.length > 0 ? topScores[topScores.length - 1] : null;

        // Add isTopPerformer flag
        const candidatesWithFlags = resumes.map(resume => {
            const resumeObj = resume.toObject();
            resumeObj.isTopPerformer =
                resume.processingStatus === 'completed' &&
                minTopScore !== null &&
                resume.score >= minTopScore;
            return resumeObj;
        });

        res.status(200).json({
            success: true,
            count: candidatesWithFlags.length,
            candidates: candidatesWithFlags,
        });

    } catch (error) {
        console.error('Get candidates error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching candidates',
        });
    }
};

/**
 * Delete a candidate
 * DELETE /api/resumes/:id
 */
const deleteCandidate = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const resume = await Resume.findOneAndDelete({ _id: id, userId });

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: 'Candidate not found',
            });
        }

        // Optional: Delete from Supabase Storage as well if needed
        // const filePath = resume.supabaseFileUrl.split('/resumes/')[1];
        // await supabase.storage.from('resumes').remove([filePath]);

        res.status(200).json({
            success: true,
            message: 'Candidate deleted successfully',
        });

    } catch (error) {
        console.error('Delete candidate error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting candidate',
        });
    }
};
/**
 * Update candidate status (tag)
 * PATCH /api/resumes/:id/status
 */
const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { tagStatus } = req.body;
        const userId = req.user.id;

        const validStatuses = ['applied', 'shortlisted', 'interviewed', 'rejected'];
        if (!validStatuses.includes(tagStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status',
            });
        }

        const resume = await Resume.findOneAndUpdate(
            { _id: id, userId },
            { tagStatus },
            { new: true }
        );

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: 'Candidate not found',
            });
        }

        res.status(200).json({
            success: true,
            candidate: resume,
        });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating candidate status',
        });
    }
};

/**
 * Toggle candidate pin
 * PATCH /api/resumes/:id/pin
 */
const togglePin = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const resume = await Resume.findOne({ _id: id, userId });
        if (!resume) {
            return res.status(404).json({
                success: false,
                message: 'Candidate not found',
            });
        }

        resume.isPinned = !resume.isPinned;
        await resume.save();

        res.status(200).json({
            success: true,
            candidate: resume,
        });
    } catch (error) {
        console.error('Toggle pin error:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling candidate pin',
        });
    }
};

/**
 * Bulk update candidate status
 * PATCH /api/resumes/bulk-status
 */
const bulkUpdateStatus = async (req, res) => {
    try {
        const { ids, tagStatus } = req.body;
        const userId = req.user.id;

        const validStatuses = ['applied', 'shortlisted', 'interviewed', 'rejected'];
        if (!validStatuses.includes(tagStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status',
            });
        }

        const result = await Resume.updateMany(
            { _id: { $in: ids }, userId },
            { tagStatus }
        );

        res.status(200).json({
            success: true,
            message: `${result.modifiedCount} candidates updated`,
        });
    } catch (error) {
        console.error('Bulk update status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating candidates status',
        });
    }
};

module.exports = {
    uploadResume,
    getCandidates,
    deleteCandidate,
    updateStatus,
    togglePin,
    bulkUpdateStatus,
};
