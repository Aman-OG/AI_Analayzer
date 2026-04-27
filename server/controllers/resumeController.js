const supabase = require('../config/supabaseClient');
const { parseResume } = require('../utils/resumeParser');
const { triggerGroqAnalysis, generateInterviewGuide: generateAIGuide } = require('../services/groqService');
const crypto = require('crypto');
const { sendInterviewEmail, sendRejectionEmail } = require('../services/emailService');

const isValidUUID = (uuid) => {
    return /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i.test(uuid);
};

// Utility to format Supabase resume row to match frontend Mongoose expectations
const formatResume = (row) => ({
    ...row,
    _id: row.id,
    jobId: row.job_id,
    userId: row.user_id,
    originalFilename: row.original_filename,
    candidateName: row.candidate_name,
    fileType: row.file_type,
    fileHash: row.file_hash,
    supabaseFileUrl: row.supabase_file_url,
    extractedText: row.extracted_text,
    processingStatus: row.processing_status,
    aiAnalysis: row.gemini_analysis,
    tagStatus: row.tag_status,
    isPinned: row.is_pinned,
    uploadTimestamp: row.upload_timestamp,
});

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

        if (!jobId || !isValidUUID(jobId)) {
            return res.status(400).json({
                success: false,
                message: 'A valid Job ID is required',
            });
        }

        // Verify job exists and belongs to user
        const { data: job, error: jobError } = await supabase
            .from('job_descriptions')
            .select('id')
            .eq('id', jobId)
            .eq('user_id', userId)
            .single();

        if (jobError || !job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found',
            });
        }

        // Check for duplicate resume
        const { data: duplicate } = await supabase
            .from('resumes')
            .select('id')
            .eq('job_id', jobId)
            .eq('user_id', userId)
            .eq('original_filename', file.originalname)
            .maybeSingle();

        if (duplicate) {
            return res.status(400).json({
                success: false,
                message: `The resume '${file.originalname}' has already been uploaded for this position.`,
            });
        }

        const fileType = file.mimetype === 'application/pdf' ? 'pdf' : 'docx';
        const fileHash = crypto.createHash('md5').update(file.buffer).digest('hex');

        // Check for existing hash analysis
        const { data: existingHashResume } = await supabase
            .from('resumes')
            .select('*')
            .eq('job_id', jobId)
            .eq('file_hash', fileHash)
            .eq('processing_status', 'completed')
            .maybeSingle();

        if (existingHashResume) {
            console.log(`✨ Hash match found! Reusing analysis for file: ${file.originalname}`);

            const fileName = `${userId}/${jobId}/${Date.now()}_${file.originalname}`;
            const { error: uploadError } = await supabase.storage
                .from('resumes')
                .upload(fileName, file.buffer, { contentType: file.mimetype });

            if (!uploadError) {
                const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(fileName);

                const { data: resume, error: insertError } = await supabase
                    .from('resumes')
                    .insert({
                        job_id: jobId,
                        user_id: userId,
                        original_filename: file.originalname,
                        file_type: fileType,
                        file_hash: fileHash,
                        supabase_file_url: urlData.publicUrl,
                        extracted_text: existingHashResume.extracted_text,
                        processing_status: 'completed',
                        score: existingHashResume.score,
                        gemini_analysis: existingHashResume.gemini_analysis
                    })
                    .select()
                    .single();

                if (!insertError) {
                    return res.status(201).json({
                        success: true,
                        message: 'Resume detected as duplicate (content). Analysis reused instantly.',
                        resumeId: resume.id,
                    });
                }
            }
        }

        // Extract text
        let extractedText;
        try {
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

        // Upload file
        const fileName = `${userId}/${jobId}/${Date.now()}_${file.originalname}`;
        console.log(`📤 Uploading to Supabase: ${fileName}`);

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('resumes')
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: false,
            });

        if (uploadError) {
            return res.status(500).json({
                success: false,
                message: `File upload failed: ${uploadError.message}`,
            });
        }

        const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(fileName);

        // Save resume 'processing'
        const { data: resume, error: insertError } = await supabase
            .from('resumes')
            .insert({
                job_id: jobId,
                user_id: userId,
                original_filename: file.originalname,
                file_type: fileType,
                file_hash: fileHash,
                supabase_file_url: urlData.publicUrl,
                extracted_text: extractedText,
                processing_status: 'processing',
            })
            .select()
            .single();

        if (insertError) {
            throw insertError;
        }

        // Trigger async analysis
        triggerGroqAnalysis(resume.id.toString()).catch(err => {
            console.error('Background analysis trigger error:', err);
        });

        res.status(201).json({
            success: true,
            message: 'Resume uploaded successfully. Analysis in progress.',
            resumeId: resume.id,
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

        if (!jobId || !isValidUUID(jobId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Job ID format',
            });
        }

        const { data: job, error: jobError } = await supabase
            .from('job_descriptions')
            .select('id')
            .eq('id', jobId)
            .eq('user_id', userId)
            .single();

        if (jobError || !job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found',
            });
        }

        // Get ALL resumes (exclude large text via Supabase select)
        const { data: resumesData, error: resumesError } = await supabase
            .from('resumes')
            .select('id, job_id, user_id, original_filename, candidate_name, file_type, file_hash, supabase_file_url, processing_status, score, gemini_analysis, tag_status, is_pinned, upload_timestamp')
            .eq('job_id', jobId)
            .order('score', { ascending: false })
            .order('upload_timestamp', { ascending: false });

        if (resumesError) {
            throw resumesError;
        }

        const resumes = resumesData.map(formatResume);

        const completedResumes = resumes.filter(r => r.processingStatus === 'completed');
        const top20PercentCount = Math.ceil(completedResumes.length * 0.2);
        const topScores = completedResumes
            .map(r => r.score)
            .sort((a, b) => b - a)
            .slice(0, top20PercentCount);
        const minTopScore = topScores.length > 0 ? topScores[topScores.length - 1] : null;

        const candidatesWithFlags = resumes.map(resume => {
            return {
                ...resume,
                isTopPerformer: resume.processingStatus === 'completed' && minTopScore !== null && resume.score >= minTopScore
            };
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

        const { data: resume, error } = await supabase
            .from('resumes')
            .delete()
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error || !resume) {
            return res.status(404).json({
                success: false,
                message: 'Candidate not found',
            });
        }

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
        const { tagStatus, candidateEmail, jobTitle, companyName } = req.body;
        const userId = req.user.id;

        const validStatuses = ['applied', 'shortlisted', 'interviewed', 'offered', 'rejected'];
        if (!validStatuses.includes(tagStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status',
            });
        }

        const { data: resume, error } = await supabase
            .from('resumes')
            .update({ tag_status: tagStatus })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error || !resume) {
            return res.status(404).json({
                success: false,
                message: 'Candidate not found',
            });
        }

        // Trigger email if requested and status matches
        if (candidateEmail && jobTitle) {
            if (tagStatus === 'rejected') {
                sendRejectionEmail({
                    candidateName: resume.candidate_name,
                    candidateEmail,
                    jobTitle,
                    company: companyName
                });
            } else if (tagStatus === 'interviewed') {
                sendInterviewEmail({
                    candidateName: resume.candidate_name,
                    candidateEmail,
                    jobTitle,
                    company: companyName
                });
            }
        }

        res.status(200).json({
            success: true,
            candidate: formatResume(resume),
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

        const { data: currentResume, error: fetchError } = await supabase
            .from('resumes')
            .select('is_pinned')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (fetchError || !currentResume) {
            return res.status(404).json({
                success: false,
                message: 'Candidate not found',
            });
        }

        const { data: resume, error } = await supabase
            .from('resumes')
            .update({ is_pinned: !currentResume.is_pinned })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;

        res.status(200).json({
            success: true,
            candidate: formatResume(resume),
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
        const { ids, tagStatus, candidateEmail, jobTitle, companyName } = req.body;
        const userId = req.user.id;

        const validStatuses = ['applied', 'shortlisted', 'interviewed', 'offered', 'rejected'];
        if (!validStatuses.includes(tagStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status',
            });
        }

        const { data, error } = await supabase
            .from('resumes')
            .update({ tag_status: tagStatus })
            .in('id', ids)
            .eq('user_id', userId)
            .select();

        if (error) throw error;

        // If email was requested, send to ALL updated candidates
        // Note: For bulk, candidateEmail is ignored since we try to use the DB or we don't send emails for bulk.
        // Bulk emails without stored emails is tricky. Let's just update status for now.
        // If we want to send bulk emails, we need their emails stored in DB.
        // We'll skip bulk emails to keep it simple, or only send to the first one if provided.

        res.status(200).json({
            success: true,
            message: `${data.length} candidates updated`,
        });
    } catch (error) {
        console.error('Bulk update status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating candidates status',
        });
    }
};

/**
 * Generate AI Interview Guide for top candidates
 * POST /api/resumes/interview-guide
 */
const generateInterviewGuide = async (req, res) => {
    try {
        const { jobId, candidateIds } = req.body;
        const userId = req.user.id;

        if (!jobId || !isValidUUID(jobId)) {
            return res.status(400).json({
                success: false,
                message: 'A valid Job ID is required',
            });
        }

        if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0 || candidateIds.length > 10) {
            return res.status(400).json({
                success: false,
                message: 'Candidate IDs array is required (max 10 candidates)',
            });
        }
        
        if (!candidateIds.every(isValidUUID)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid candidate ID format in array',
            });
        }

        const { data: job, error: jobError } = await supabase
            .from('job_descriptions')
            .select('*')
            .eq('id', jobId)
            .eq('user_id', userId)
            .single();

        if (jobError || !job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found',
            });
        }

        const { data: candidatesData, error: candidatesError } = await supabase
            .from('resumes')
            .select('*')
            .in('id', candidateIds)
            .eq('job_id', jobId)
            .eq('user_id', userId);

        if (candidatesError || !candidatesData || candidatesData.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No matching candidates found',
            });
        }
        
        const formattedJob = {
            ...job,
            descriptionText: job.description_text,
            mustHaveSkills: job.must_have_skills,
            focusAreas: job.focus_areas,
        };

        const candidates = candidatesData.map(formatResume);

        const guide = await generateAIGuide(formattedJob, candidates);

        res.status(200).json({
            success: true,
            guide
        });
    } catch (error) {
        console.error('Generate interview guide error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating interview guide',
        });
    }
};

/**
 * Bulk delete candidates
 * DELETE /api/resumes/bulk
 */
const bulkDeleteCandidates = async (req, res) => {
    try {
        const { ids } = req.body;
        const userId = req.user.id;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No candidate IDs provided',
            });
        }

        const { data, error } = await supabase
            .from('resumes')
            .delete()
            .in('id', ids)
            .eq('user_id', userId)
            .select();

        if (error) throw error;

        res.status(200).json({
            success: true,
            message: `${data ? data.length : 0} candidates deleted successfully`,
        });

    } catch (error) {
        console.error('Bulk delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting candidates',
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
    generateInterviewGuide,
    bulkDeleteCandidates,
};
