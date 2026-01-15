// src/services/resumeService.ts
import apiClient from './apiClient';
import type { Candidate, ResumeUploadResponse } from '../types/index';

export interface ResumeStatusResponse {
  resumeId: string;
  processingStatus: 'uploaded' | 'processing' | 'completed' | 'error';
  errorDetails?: string;
  score?: number;
  originalFilename: string;
}

const resumeService = {
  // POST /api/resumes/upload - Upload multiple resume files
  uploadResume: async (jobId: string, resumeFiles: File[]): Promise<ResumeUploadResponse> => {
    const formData = new FormData();
    formData.append('jobId', jobId);

    resumeFiles.forEach(file => {
      formData.append('resumeFiles', file);
    });

    const response = await apiClient.post<ResumeUploadResponse>('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // GET /api/resumes/job/:jobId/candidates - Get processed candidates for a job
  getCandidatesForJob: async (jobId: string): Promise<Candidate[]> => {
    const response = await apiClient.get<Candidate[]>(`/resumes/job/${jobId}/candidates`);
    return response.data;
  },

  // GET /api/resumes/:resumeId/status - Check resume processing status
  getResumeStatus: async (resumeId: string): Promise<ResumeStatusResponse> => {
    const response = await apiClient.get<ResumeStatusResponse>(`/resumes/${resumeId}/status`);
    return response.data;
  },
  // GET /api/resumes/job/:jobId/export - Export candidates as CSV
  exportCandidates: async (jobId: string, jobTitle: string): Promise<void> => {
    const response = await apiClient.get(`/resumes/job/${jobId}/export`, {
      responseType: 'blob',
    });

    // Create a link and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    const filename = `candidates_${jobTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  getRecruiterStats: async (): Promise<any> => {
    const response = await apiClient.get('/resumes/stats');
    return response.data;
  }
};

export default resumeService;
