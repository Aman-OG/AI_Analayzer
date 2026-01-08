// src/__tests__/fixtures/mockData.ts

/**
 * Mock data fixtures for frontend testing
 */

export const mockUsers = {
    validUser: {
        id: 'user-123',
        email: 'test@example.com',
    },
    adminUser: {
        id: 'admin-456',
        email: 'admin@example.com',
    },
};

export const mockJobs = {
    softwareEngineer: {
        _id: 'job-123',
        userId: 'user-123',
        title: 'Software Engineer',
        descriptionText: 'Looking for a talented software engineer',
        mustHaveSkills: ['JavaScript', 'React', 'Node.js'],
        niceToHaveSkills: ['TypeScript', 'MongoDB'],
        focusAreas: ['Backend', 'Frontend'],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
    },
    dataScientist: {
        _id: 'job-456',
        userId: 'user-123',
        title: 'Data Scientist',
        descriptionText: 'Seeking a data scientist',
        mustHaveSkills: ['Python', 'Machine Learning'],
        niceToHaveSkills: ['TensorFlow', 'PyTorch'],
        focusAreas: ['Data Analysis'],
        createdAt: '2024-01-02T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
    },
};

export const mockResumes = {
    completed: {
        _id: 'resume-123',
        userId: 'user-123',
        jobId: 'job-123',
        originalFilename: 'john_doe_resume.pdf',
        fileType: 'application/pdf',
        uploadTimestamp: '2024-01-01T00:00:00.000Z',
        processingStatus: 'completed',
        score: 9,
        geminiAnalysis: {
            skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
            yearsExperience: '5',
            education: ['Bachelor of Science in Computer Science'],
            justification: 'Excellent match with all required skills',
            warnings: [],
        },
    },
    processing: {
        _id: 'resume-456',
        userId: 'user-123',
        jobId: 'job-123',
        originalFilename: 'jane_smith_resume.pdf',
        fileType: 'application/pdf',
        uploadTimestamp: '2024-01-02T00:00:00.000Z',
        processingStatus: 'processing',
    },
    error: {
        _id: 'resume-789',
        userId: 'user-123',
        jobId: 'job-123',
        originalFilename: 'error_resume.pdf',
        fileType: 'application/pdf',
        uploadTimestamp: '2024-01-03T00:00:00.000Z',
        processingStatus: 'error',
        errorDetails: 'Failed to extract text from file',
    },
};

export const mockCandidates = [
    {
        candidateId: 'resume-123',
        originalFilename: 'john_doe_resume.pdf',
        fileType: 'application/pdf',
        uploadTimestamp: '2024-01-01T00:00:00.000Z',
        score: 9,
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        yearsExperience: '5',
        education: ['Bachelor of Science in Computer Science'],
        justification: 'Excellent match with all required skills',
        warnings: [],
        isFlagged: true,
    },
    {
        candidateId: 'resume-456',
        originalFilename: 'jane_smith_resume.pdf',
        fileType: 'application/pdf',
        uploadTimestamp: '2024-01-02T00:00:00.000Z',
        score: 7,
        skills: ['JavaScript', 'Python', 'SQL'],
        yearsExperience: '3',
        education: ['Bachelor of Arts in Information Technology'],
        justification: 'Good candidate but missing some key skills',
        warnings: ['Missing React experience'],
        isFlagged: false,
    },
];

export const mockAuthResponses = {
    loginSuccess: {
        user: mockUsers.validUser,
        session: {
            access_token: 'mock-token-123',
            refresh_token: 'mock-refresh-123',
        },
    },
    signupSuccess: {
        user: mockUsers.validUser,
        session: {
            access_token: 'mock-token-123',
            refresh_token: 'mock-refresh-123',
        },
    },
};

export const mockApiResponses = {
    jobs: {
        getAll: [mockJobs.softwareEngineer, mockJobs.dataScientist],
        getOne: mockJobs.softwareEngineer,
        create: mockJobs.softwareEngineer,
        update: { ...mockJobs.softwareEngineer, title: 'Senior Software Engineer' },
        delete: { message: 'Job deleted successfully' },
    },
    resumes: {
        upload: {
            message: 'Resume uploaded and text extracted. Analysis has been queued.',
            resumeId: 'resume-123',
        },
        getCandidates: mockCandidates,
    },
};
