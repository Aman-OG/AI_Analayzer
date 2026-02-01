const JobDescription = require('../models/JobDescriptionModel');

/**
 * Get all jobs for the logged-in user
 * GET /api/jobs
 */
const getAllJobs = async (req, res) => {
    try {
        const userId = req.user.id;

        const jobs = await JobDescription.aggregate([
            { $match: { userId } },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: 'resumes',
                    localField: '_id',
                    foreignField: 'jobId',
                    as: 'resumes'
                }
            },
            {
                $addFields: {
                    candidateCount: { $size: '$resumes' }
                }
            },
            {
                $project: {
                    resumes: 0,
                    __v: 0
                }
            }
        ]);

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

        const job = await JobDescription.findOne({ _id: id, userId });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found',
            });
        }

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

        const job = await JobDescription.create({
            title,
            company,
            descriptionText,
            mustHaveSkills: mustHaveSkills || [],
            focusAreas: focusAreas || [],
            userId,
        });

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

        const job = await JobDescription.findOne({ _id: id, userId });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found',
            });
        }

        // Update fields
        if (title) job.title = title;
        if (company !== undefined) job.company = company;
        if (descriptionText) job.descriptionText = descriptionText;
        if (mustHaveSkills !== undefined) job.mustHaveSkills = mustHaveSkills;
        if (focusAreas !== undefined) job.focusAreas = focusAreas;

        await job.save();

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

        const job = await JobDescription.findOneAndDelete({ _id: id, userId });

        if (!job) {
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
