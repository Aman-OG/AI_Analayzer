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
  // POST /api/resumes/upload - Upload a resume file
  uploadResume: async (jobId: string, resumeFile: File): Promise<ResumeUploadResponse> => {
    const formData = new FormData();
    formData.append('jobId', jobId);
    formData.append('resumeFile', resumeFile);

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
};

export default resumeService;
