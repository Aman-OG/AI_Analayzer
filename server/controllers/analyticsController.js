const supabase = require('../config/supabaseClient');

/**
 * Get dashboard analytics metrics for the logged-in user
 * GET /api/analytics/dashboard
 */
const getDashboardMetrics = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch all jobs for this user
        const { data: jobs, error: jobsError } = await supabase
            .from('job_descriptions')
            .select('id, title, company, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (jobsError) throw jobsError;

        if (!jobs || jobs.length === 0) {
            return res.status(200).json({
                success: true,
                metrics: {
                    totalCandidates: 0,
                    averageScore: 0,
                    topPerformersPercent: 0,
                    activeJobs: 0,
                    pipelineStages: {
                        applied: 0,
                        shortlisted: 0,
                        interviewed: 0,
                        offered: 0,
                        rejected: 0,
                    },
                    scoreDistribution: Array(10).fill(0),
                    jobBreakdown: [],
                    uploadTimeline: [],
                },
            });
        }

        const jobIds = jobs.map(j => j.id);

        // Fetch all resumes for these jobs (lightweight select)
        const { data: resumes, error: resumesError } = await supabase
            .from('resumes')
            .select('id, job_id, score, tag_status, processing_status, upload_timestamp')
            .in('job_id', jobIds)
            .eq('user_id', userId);

        if (resumesError) throw resumesError;

        const allResumes = resumes || [];

        // --- KPI Calculations ---
        const totalCandidates = allResumes.length;
        const completedResumes = allResumes.filter(r => r.processing_status === 'completed');
        const scores = completedResumes.map(r => r.score).filter(s => s != null);
        const averageScore = scores.length > 0
            ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
            : 0;

        const topPerformersCount = scores.filter(s => s >= 8).length;
        const topPerformersPercent = scores.length > 0
            ? Math.round((topPerformersCount / scores.length) * 100)
            : 0;

        // --- Pipeline Stage Counts ---
        const pipelineStages = {
            applied: 0,
            shortlisted: 0,
            interviewed: 0,
            offered: 0,
            rejected: 0,
        };

        allResumes.forEach(r => {
            const status = r.tag_status || 'applied';
            if (pipelineStages[status] !== undefined) {
                pipelineStages[status]++;
            } else {
                pipelineStages.applied++;
            }
        });

        // --- Score Distribution (histogram: indices 0-9 map to scores 1-10) ---
        const scoreDistribution = Array(10).fill(0);
        scores.forEach(s => {
            const idx = Math.min(Math.max(Math.round(s) - 1, 0), 9);
            scoreDistribution[idx]++;
        });

        // --- Per-Job Breakdown ---
        const jobBreakdown = jobs.map(job => {
            const jobResumes = allResumes.filter(r => r.job_id === job.id);
            const jobCompleted = jobResumes.filter(r => r.processing_status === 'completed');
            const jobScores = jobCompleted.map(r => r.score).filter(s => s != null);

            const stages = { applied: 0, shortlisted: 0, interviewed: 0, offered: 0, rejected: 0 };
            jobResumes.forEach(r => {
                const st = r.tag_status || 'applied';
                if (stages[st] !== undefined) stages[st]++;
                else stages.applied++;
            });

            return {
                jobId: job.id,
                title: job.title,
                company: job.company || 'Direct Hiring',
                candidateCount: jobResumes.length,
                avgScore: jobScores.length > 0
                    ? Math.round((jobScores.reduce((a, b) => a + b, 0) / jobScores.length) * 10) / 10
                    : 0,
                topScore: jobScores.length > 0 ? Math.max(...jobScores) : 0,
                stages,
            };
        });

        // --- Upload Timeline (last 30 days) ---
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const uploadTimeline = [];

        for (let i = 0; i <= 30; i++) {
            const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            const count = allResumes.filter(r => {
                const ts = r.upload_timestamp;
                if (!ts) return false;
                try {
                    const uploadDate = new Date(ts).toISOString().split('T')[0];
                    return uploadDate === dateStr;
                } catch(e) { return false; }
            }).length;
            uploadTimeline.push({ date: dateStr, count });
        }

        res.status(200).json({
            success: true,
            metrics: {
                totalCandidates,
                averageScore,
                topPerformersPercent,
                activeJobs: jobs.length,
                pipelineStages,
                scoreDistribution,
                jobBreakdown,
                uploadTimeline,
            },
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching analytics',
        });
    }
};

module.exports = {
    getDashboardMetrics,
};
