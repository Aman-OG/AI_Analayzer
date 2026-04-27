const supabase = require('../config/supabaseClient');

/**
 * Get all jobs for the logged-in user
 * GET /api/jobs
 */
const getAllJobs = async (req, res) => {
    try {
        const userId = req.user.id;

        const { data: jobsData, error } = await supabase
            .from('job_descriptions')
            .select(`
                *,
                resumes!left(id)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        // Map data to match frontend expectations (_id and candidateCount)
        const jobs = jobsData.map(job => ({
            ...job,
            _id: job.id,
            descriptionText: job.description_text,
            mustHaveSkills: job.must_have_skills,
            focusAreas: job.focus_areas,
            createdAt: job.created_at,
            candidateCount: job.resumes ? job.resumes.length : 0
        }));

        res.status(200).json({
            success: true,
            count: jobs.length,
            jobs,
        });

    } catch (error) {
        console.error('Get jobs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching jobs',
        });
    }
};

/**
 * Get a single job by ID
 * GET /api/jobs/:id
 */
const getJobById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const { data: jobData, error } = await supabase
            .from('job_descriptions')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error || !jobData) {
            return res.status(404).json({
                success: false,
                message: 'Job not found',
            });
        }

        const job = {
            ...jobData,
            _id: jobData.id,
            descriptionText: jobData.description_text,
            mustHaveSkills: jobData.must_have_skills,
            focusAreas: jobData.focus_areas,
            createdAt: jobData.created_at,
        };

        res.status(200).json({
            success: true,
            job,
        });

    } catch (error) {
        console.error('Get job error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching job',
        });
    }
};

/**
 * Create a new job
 * POST /api/jobs
 */
const createJob = async (req, res) => {
    try {
        const { title, company, descriptionText, mustHaveSkills, focusAreas } = req.body;
        const userId = req.user.id;

        if (!title || !descriptionText) {
            return res.status(400).json({
                success: false,
                message: 'Title and description are required',
            });
        }

        const { data: jobData, error } = await supabase
            .from('job_descriptions')
            .insert({
                user_id: userId,
                title,
                company,
                description_text: descriptionText,
                must_have_skills: mustHaveSkills || [],
                focus_areas: focusAreas || []
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        const job = {
            ...jobData,
            _id: jobData.id,
            descriptionText: jobData.description_text,
            mustHaveSkills: jobData.must_have_skills,
            focusAreas: jobData.focus_areas,
            createdAt: jobData.created_at,
        };

        res.status(201).json({
            success: true,
            message: 'Job created successfully',
            job,
        });

    } catch (error) {
        console.error('Create job error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating job',
        });
    }
};

/**
 * Update a job
 * PUT /api/jobs/:id
 */
const updateJob = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { title, company, descriptionText, mustHaveSkills, focusAreas } = req.body;

        const updateData = { updated_at: new Date().toISOString() };
        if (title) updateData.title = title;
        if (company !== undefined) updateData.company = company;
        if (descriptionText) updateData.description_text = descriptionText;
        if (mustHaveSkills !== undefined) updateData.must_have_skills = mustHaveSkills;
        if (focusAreas !== undefined) updateData.focus_areas = focusAreas;

        const { data: jobData, error } = await supabase
            .from('job_descriptions')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error || !jobData) {
            return res.status(404).json({
                success: false,
                message: 'Job not found',
            });
        }

        const job = {
            ...jobData,
            _id: jobData.id,
            descriptionText: jobData.description_text,
            mustHaveSkills: jobData.must_have_skills,
            focusAreas: jobData.focus_areas,
            createdAt: jobData.created_at,
        };

        res.status(200).json({
            success: true,
            message: 'Job updated successfully',
            job,
        });

    } catch (error) {
        console.error('Update job error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating job',
        });
    }
};

/**
 * Delete a job
 * DELETE /api/jobs/:id
 */
const deleteJob = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const { data: jobData, error } = await supabase
            .from('job_descriptions')
            .delete()
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error || !jobData) {
            return res.status(404).json({
                success: false,
                message: 'Job not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Job deleted successfully',
        });

    } catch (error) {
        console.error('Delete job error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting job',
        });
    }
};

module.exports = {
    getAllJobs,
    getJobById,
    createJob,
    updateJob,
    deleteJob,
};
