import api from './api';
import type { JobDescription, Resume } from '../types';
import chatService from './chatService';

export { chatService };

export const jobService = {
    // Get all jobs
    async getAllJobs() {
        const response = await api.get<{ success: boolean; jobs: JobDescription[] }>('/jobs');
        return response.data.jobs;
    },

    // Get single job
    async getJobById(id: string) {
        const response = await api.get<{ success: boolean; job: JobDescription }>(`/jobs/${id}`);
        return response.data.job;
    },

    // Create job
    async createJob(data: {
        title: string;
        company?: string;
        descriptionText: string;
        mustHaveSkills?: string[];
        focusAreas?: string[];
    }) {
        const response = await api.post<{ success: boolean; job: JobDescription }>('/jobs', data);
        return response.data.job;
    },

    // Update job
    async updateJob(id: string, data: Partial<JobDescription>) {
        const response = await api.put<{ success: boolean; job: JobDescription }>(`/jobs/${id}`, data);
        return response.data.job;
    },

    // Delete job
    async deleteJob(id: string) {
        const response = await api.delete<{ success: boolean }>(`/jobs/${id}`);
        return response.data;
    },
};

export const resumeService = {
    // Upload resume
    async uploadResume(jobId: string, file: File) {
        const formData = new FormData();
        formData.append('resume', file);
        formData.append('jobId', jobId);

        const response = await api.post<{ success: boolean; resumeId: string }>(
            '/resumes/upload',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    },

    // Get candidates for a job
    async getCandidates(jobId: string) {
        const response = await api.get<{ success: boolean; candidates: Resume[] }>(
            `/resumes/candidates/${jobId}`
        );
        return response.data.candidates;
    },

    // Update candidate status
    async updateStatus(id: string, tagStatus: string, candidateEmail?: string | null, jobTitle?: string, companyName?: string) {
        const response = await api.patch<{ success: boolean; candidate: Resume }>(
            `/resumes/${id}/status`,
            { tagStatus, candidateEmail, jobTitle, companyName }
        );
        return response.data;
    },

    // Toggle candidate pin
    async togglePin(id: string) {
        const response = await api.patch<{ success: boolean; candidate: Resume }>(
            `/resumes/${id}/pin`
        );
        return response.data;
    },

    // Bulk update statuses
    async bulkUpdateStatus(ids: string[], tagStatus: string) {
        const response = await api.patch<{ success: boolean; message: string }>(
            '/resumes/bulk-status',
            { ids, tagStatus }
        );
        return response.data;
    },

    // Generate AI Interview Guide
    async generateInterviewGuide(jobId: string, candidateIds: string[]) {
        const response = await api.post<{ success: boolean; guide: string }>(
            '/resumes/interview-guide',
            { jobId, candidateIds }
        );
        return response.data;
    },
};

export const analyticsService = {
    // Get dashboard metrics
    async getDashboardMetrics() {
        const response = await api.get<{
            success: boolean;
            metrics: {
                totalCandidates: number;
                averageScore: number;
                topPerformersPercent: number;
                activeJobs: number;
                pipelineStages: {
                    applied: number;
                    shortlisted: number;
                    interviewed: number;
                    offered: number;
                    rejected: number;
                };
                scoreDistribution: number[];
                jobBreakdown: Array<{
                    jobId: string;
                    title: string;
                    company: string;
                    candidateCount: number;
                    avgScore: number;
                    topScore: number;
                    stages: {
                        applied: number;
                        shortlisted: number;
                        interviewed: number;
                        offered: number;
                        rejected: number;
                    };
                }>;
                uploadTimeline: Array<{
                    date: string;
                    count: number;
                }>;
            };
        }>('/analytics/dashboard');
        return response.data.metrics;
    },
};
