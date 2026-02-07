import api from './api';
import type { JobDescription, Resume } from '../types';

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
    async updateStatus(id: string, tagStatus: string) {
        const response = await api.patch<{ success: boolean; candidate: Resume }>(
            `/resumes/${id}/status`,
            { tagStatus }
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
};
