export type User = {
    id: string;
    email: string;
    full_name?: string;
};

export type Session = {
    access_token: string;
    refresh_token: string;
    user: User;
};

export type JobDescription = {
    _id: string;
    title: string;
    company?: string;
    descriptionText: string;
    mustHaveSkills: string[];
    focusAreas: string[];
    userId: string;
    createdAt: string;
    updatedAt: string;
};

export type Education = {
    degree: string;
    institution: string;
    graduationYear: string;
};

export type aiAnalysis = {
    skills: string[];
    yearsExperience: number | string;
    education: Education[];
    fitScore: number;
    technicalFit?: number;
    experienceMatch?: number;
    educationLevel?: number;
    justification: string;
    warnings: string[];
    interviewQuestions?: string[];
};

export type Resume = {
    _id: string;
    jobId: string;
    userId: string;
    originalFilename: string;
    candidateName?: string;
    fileType: 'pdf' | 'docx';
    fileHash?: string;
    isReviewed?: boolean;
    tagStatus?: 'applied' | 'shortlisted' | 'interviewed' | 'offered' | 'rejected';
    isPinned?: boolean;
    supabaseFileUrl: string;
    uploadTimestamp: string;
    processingStatus: 'uploaded' | 'processing' | 'completed' | 'error' | 'parsing' | 'scoring' | 'finalizing';
    errorDetails?: string;
    score?: number;
    aiAnalysis?: aiAnalysis;
    analysis?: aiAnalysis;
    isTopPerformer?: boolean;
    createdAt: string;
    updatedAt: string;
};

export type ApiResponse<T> = {
    success: boolean;
    message?: string;
    data?: T;
};
