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

export type GeminiAnalysis = {
    skills: string[];
    yearsExperience: number | string;
    education: Education[];
    fitScore: number;
    justification: string;
    warnings: string[];
};

export type Resume = {
    _id: string;
    jobId: string;
    userId: string;
    originalFilename: string;
    fileType: 'pdf' | 'docx';
    supabaseFileUrl: string;
    uploadTimestamp: string;
    processingStatus: 'uploaded' | 'processing' | 'completed' | 'error';
    errorDetails?: string;
    score?: number;
    geminiAnalysis?: GeminiAnalysis;
    analysis?: GeminiAnalysis; // Alias for Groq analysis results
    isTopPerformer?: boolean;
    createdAt: string;
    updatedAt: string;
};

export type ApiResponse<T> = {
    success: boolean;
    message?: string;
    data?: T;
};
