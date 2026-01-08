// server/__tests__/fixtures/mockData.js

/**
 * Mock data fixtures for testing
 */

const mongoose = require('mongoose');

/**
 * Mock user data
 */
const mockUsers = {
    validUser: {
        id: new mongoose.Types.ObjectId().toString(),
        email: 'test@example.com',
        password: 'password123',
    },
    adminUser: {
        id: new mongoose.Types.ObjectId().toString(),
        email: 'admin@example.com',
        password: 'admin123',
    },
    otherUser: {
        id: new mongoose.Types.ObjectId().toString(),
        email: 'other@example.com',
        password: 'other123',
    },
};

/**
 * Mock job description data
 */
const mockJobs = {
    softwareEngineer: {
        title: 'Software Engineer',
        descriptionText: 'We are looking for a talented software engineer with experience in Node.js and React.',
        mustHaveSkills: ['JavaScript', 'Node.js', 'React'],
        niceToHaveSkills: ['TypeScript', 'MongoDB', 'Docker'],
        focusAreas: ['Backend Development', 'Frontend Development'],
    },
    dataScientist: {
        title: 'Data Scientist',
        descriptionText: 'Seeking a data scientist with strong Python and ML skills.',
        mustHaveSkills: ['Python', 'Machine Learning', 'Statistics'],
        niceToHaveSkills: ['TensorFlow', 'PyTorch', 'SQL'],
        focusAreas: ['Data Analysis', 'Model Development'],
    },
    devOpsEngineer: {
        title: 'DevOps Engineer',
        descriptionText: 'Looking for a DevOps engineer to manage our infrastructure.',
        mustHaveSkills: ['Docker', 'Kubernetes', 'AWS'],
        niceToHaveSkills: ['Terraform', 'Jenkins', 'Ansible'],
        focusAreas: ['Infrastructure', 'CI/CD'],
    },
};

/**
 * Mock resume data
 */
const mockResumes = {
    validPDF: {
        originalname: 'john_doe_resume.pdf',
        mimetype: 'application/pdf',
        size: 2 * 1024 * 1024, // 2MB
        buffer: Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]), // %PDF-1.4
    },
    validDOC: {
        originalname: 'jane_smith_resume.doc',
        mimetype: 'application/msword',
        size: 1.5 * 1024 * 1024, // 1.5MB
        buffer: Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]),
    },
    validDOCX: {
        originalname: 'bob_johnson_resume.docx',
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 1 * 1024 * 1024, // 1MB
        buffer: Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x06, 0x00]),
    },
    tooLarge: {
        originalname: 'large_resume.pdf',
        mimetype: 'application/pdf',
        size: 10 * 1024 * 1024, // 10MB
        buffer: Buffer.from([0x25, 0x50, 0x44, 0x46]),
    },
    invalidType: {
        originalname: 'resume.txt',
        mimetype: 'text/plain',
        size: 1024,
        buffer: Buffer.from('Plain text resume'),
    },
    malicious: {
        originalname: 'malicious.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        buffer: Buffer.from('<script>alert("xss")</script>'),
    },
};

/**
 * Mock Gemini analysis results
 */
const mockGeminiAnalysis = {
    goodFit: {
        skills: ['JavaScript', 'Node.js', 'React', 'MongoDB'],
        yearsExperience: '5',
        education: ['Bachelor of Science in Computer Science'],
        fitScore: 9,
        justification: 'Excellent match with all required skills and relevant experience.',
        warnings: [],
    },
    moderateFit: {
        skills: ['JavaScript', 'Python', 'SQL'],
        yearsExperience: '3',
        education: ['Bachelor of Arts in Information Technology'],
        fitScore: 6,
        justification: 'Good candidate but missing some key skills like React.',
        warnings: ['Missing React experience'],
    },
    poorFit: {
        skills: ['Java', 'C++', 'Assembly'],
        yearsExperience: '2',
        education: ['Associate Degree in Computer Science'],
        fitScore: 3,
        justification: 'Skills do not align well with job requirements.',
        warnings: ['Missing all must-have skills'],
    },
};

/**
 * Mock Supabase responses
 */
const mockSupabaseResponses = {
    signupSuccess: {
        data: {
            user: { id: 'user-123', email: 'test@example.com' },
            session: { access_token: 'token-123', refresh_token: 'refresh-123' },
        },
        error: null,
    },
    signupError: {
        data: { user: null, session: null },
        error: { message: 'Email already registered' },
    },
    loginSuccess: {
        data: {
            user: { id: 'user-123', email: 'test@example.com' },
            session: { access_token: 'token-123', refresh_token: 'refresh-123' },
        },
        error: null,
    },
    loginError: {
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
    },
    getUserSuccess: {
        data: {
            user: { id: 'user-123', email: 'test@example.com' },
        },
        error: null,
    },
    getUserError: {
        data: { user: null },
        error: { message: 'Invalid token' },
    },
};

module.exports = {
    mockUsers,
    mockJobs,
    mockResumes,
    mockGeminiAnalysis,
    mockSupabaseResponses,
};
