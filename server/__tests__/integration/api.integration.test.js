// server/__tests__/integration/api.integration.test.js
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const authRoutes = require('../../routes/authRoutes');
const jobRoutes = require('../../routes/jobRoutes');
const resumeRoutes = require('../../routes/resumeRoutes');
const JobDescription = require('../../models/JobDescriptionModel');
const Resume = require('../../models/ResumeModel');

// Mock dependencies
jest.mock('../../config/supabaseClient');
jest.mock('../../services/geminiService');
jest.mock('../../middleware/authMiddleware', () => ({
    protect: jest.fn((req, res, next) => {
        req.user = { id: 'integration-test-user', email: 'integration@test.com' };
        next();
    }),
}));

jest.mock('../../middleware/rateLimitMiddleware', () => ({
    authLimiter: jest.fn((req, res, next) => next()),
    uploadLimiter: jest.fn((req, res, next) => next()),
    jobLimiter: jest.fn((req, res, next) => next()),
    generalLimiter: jest.fn((req, res, next) => next()),
}));

let mongoServer;
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/resumes', resumeRoutes);

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    await JobDescription.deleteMany({});
    await Resume.deleteMany({});
});

describe('API Integration Tests', () => {
    describe('Complete Job Creation and Resume Upload Flow', () => {
        it('should create job, upload resume, and retrieve candidates', async () => {
            // Step 1: Create a job
            const jobResponse = await request(app)
                .post('/api/jobs')
                .send({
                    title: 'Full Stack Developer',
                    descriptionText: 'Looking for experienced full stack developer',
                    mustHaveSkills: ['JavaScript', 'React', 'Node.js'],
                    niceToHaveSkills: ['TypeScript', 'MongoDB'],
                });

            expect(jobResponse.statusCode).toBe(201);
            const jobId = jobResponse.body._id;

            // Step 2: Upload a resume for the job
            const uploadResponse = await request(app)
                .post('/api/resumes/upload')
                .field('jobId', jobId)
                .attach('resumeFile', Buffer.from('Test resume content'), 'resume.txt');

            expect(uploadResponse.statusCode).toBe(201);
            expect(uploadResponse.body.resumeId).toBeDefined();

            // Step 3: Verify job exists
            const getJobResponse = await request(app).get(`/api/jobs/${jobId}`);
            expect(getJobResponse.statusCode).toBe(200);
            expect(getJobResponse.body.title).toBe('Full Stack Developer');

            // Step 4: Get all jobs
            const getAllJobsResponse = await request(app).get('/api/jobs');
            expect(getAllJobsResponse.statusCode).toBe(200);
            expect(getAllJobsResponse.body.length).toBe(1);
        });

        it('should handle multiple resumes for same job', async () => {
            // Create job
            const jobResponse = await request(app)
                .post('/api/jobs')
                .send({
                    title: 'Software Engineer',
                    descriptionText: 'Job description',
                });

            const jobId = jobResponse.body._id;

            // Upload multiple resumes
            const upload1 = await request(app)
                .post('/api/resumes/upload')
                .field('jobId', jobId)
                .attach('resumeFile', Buffer.from('Resume 1'), 'resume1.txt');

            const upload2 = await request(app)
                .post('/api/resumes/upload')
                .field('jobId', jobId)
                .attach('resumeFile', Buffer.from('Resume 2'), 'resume2.txt');

            expect(upload1.statusCode).toBe(201);
            expect(upload2.statusCode).toBe(201);

            // Verify both resumes are in database
            const resumes = await Resume.find({ jobId });
            expect(resumes.length).toBe(2);
        });
    });

    describe('Error Handling Across Endpoints', () => {
        it('should handle invalid job ID in resume upload', async () => {
            const response = await request(app)
                .post('/api/resumes/upload')
                .field('jobId', 'invalid-id')
                .attach('resumeFile', Buffer.from('Test'), 'test.txt');

            expect(response.statusCode).toBe(400);
        });

        it('should handle non-existent job in resume upload', async () => {
            const fakeJobId = new mongoose.Types.ObjectId().toString();
            const response = await request(app)
                .post('/api/resumes/upload')
                .field('jobId', fakeJobId)
                .attach('resumeFile', Buffer.from('Test'), 'test.txt');

            expect(response.statusCode).toBe(404);
        });

        it('should handle updating non-existent job', async () => {
            const fakeJobId = new mongoose.Types.ObjectId().toString();
            const response = await request(app)
                .put(`/api/jobs/${fakeJobId}`)
                .send({ title: 'Updated Title' });

            expect(response.statusCode).toBe(404);
        });

        it('should handle deleting non-existent job', async () => {
            const fakeJobId = new mongoose.Types.ObjectId().toString();
            const response = await request(app).delete(`/api/jobs/${fakeJobId}`);

            expect(response.statusCode).toBe(404);
        });
    });

    describe('Data Consistency Tests', () => {
        it('should maintain referential integrity between jobs and resumes', async () => {
            // Create job
            const jobResponse = await request(app)
                .post('/api/jobs')
                .send({
                    title: 'Test Job',
                    descriptionText: 'Description',
                });

            const jobId = jobResponse.body._id;

            // Upload resume
            await request(app)
                .post('/api/resumes/upload')
                .field('jobId', jobId)
                .attach('resumeFile', Buffer.from('Test'), 'test.txt');

            // Delete job
            await request(app).delete(`/api/jobs/${jobId}`);

            // Verify job is deleted
            const getJobResponse = await request(app).get(`/api/jobs/${jobId}`);
            expect(getJobResponse.statusCode).toBe(404);

            // Note: In production, you might want to cascade delete resumes
            // or prevent deletion of jobs with resumes
        });

        it('should correctly filter jobs by user', async () => {
            // Create job as integration-test-user
            await request(app)
                .post('/api/jobs')
                .send({
                    title: 'User Job',
                    descriptionText: 'Description',
                });

            // Create job as different user (directly in DB)
            await JobDescription.create({
                userId: 'other-user',
                title: 'Other User Job',
                descriptionText: 'Description',
            });

            // Get jobs should only return user's jobs
            const response = await request(app).get('/api/jobs');
            expect(response.statusCode).toBe(200);
            expect(response.body.length).toBe(1);
            expect(response.body[0].title).toBe('User Job');
        });
    });

    describe('Concurrent Operations', () => {
        it('should handle concurrent job creations', async () => {
            const promises = Array.from({ length: 5 }, (_, i) =>
                request(app)
                    .post('/api/jobs')
                    .send({
                        title: `Job ${i}`,
                        descriptionText: `Description ${i}`,
                    })
            );

            const responses = await Promise.all(promises);

            responses.forEach((response) => {
                expect(response.statusCode).toBe(201);
            });

            const allJobs = await JobDescription.find({});
            expect(allJobs.length).toBe(5);
        });

        it('should handle concurrent resume uploads for same job', async () => {
            // Create job first
            const jobResponse = await request(app)
                .post('/api/jobs')
                .send({
                    title: 'Concurrent Test Job',
                    descriptionText: 'Description',
                });

            const jobId = jobResponse.body._id;

            // Upload multiple resumes concurrently
            const promises = Array.from({ length: 3 }, (_, i) =>
                request(app)
                    .post('/api/resumes/upload')
                    .field('jobId', jobId)
                    .attach('resumeFile', Buffer.from(`Resume ${i}`), `resume${i}.txt`)
            );

            const responses = await Promise.all(promises);

            responses.forEach((response) => {
                expect(response.statusCode).toBe(201);
            });

            const allResumes = await Resume.find({ jobId });
            expect(allResumes.length).toBe(3);
        });
    });
});
