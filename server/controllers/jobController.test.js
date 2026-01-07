// server/controllers/jobController.test.js
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jobRoutes = require('../routes/jobRoutes');
const JobDescription = require('../models/JobDescriptionModel');

// Mock authMiddleware
jest.mock('../middleware/authMiddleware', () => ({
    protect: jest.fn((req, res, next) => {
        req.user = { id: 'mock-user-id', email: 'test@example.com' };
        next();
    }),
}));

// Mock rate limiter
jest.mock('../middleware/rateLimitMiddleware', () => ({
    jobLimiter: jest.fn((req, res, next) => next()),
}));

let mongoServer;
const app = express();
app.use(express.json());
app.use('/api/jobs', jobRoutes);

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
});

describe('POST /api/jobs', () => {
    it('should create a new job successfully', async () => {
        const jobData = {
            title: 'Software Engineer',
            descriptionText: 'We are looking for a talented software engineer',
            mustHaveSkills: ['JavaScript', 'Node.js'],
            niceToHaveSkills: ['React', 'TypeScript'],
            focusAreas: ['Backend Development'],
        };

        const response = await request(app)
            .post('/api/jobs')
            .send(jobData);

        expect(response.statusCode).toBe(201);
        expect(response.body.title).toBe('Software Engineer');
        expect(response.body.userId).toBe('mock-user-id');
        expect(response.body.mustHaveSkills).toEqual(['JavaScript', 'Node.js']);
    });

    it('should return 400 if title is missing', async () => {
        const response = await request(app)
            .post('/api/jobs')
            .send({
                descriptionText: 'Job description',
            });

        expect(response.statusCode).toBe(400);
    });

    it('should return 400 if descriptionText is missing', async () => {
        const response = await request(app)
            .post('/api/jobs')
            .send({
                title: 'Software Engineer',
            });

        expect(response.statusCode).toBe(400);
    });
});

describe('GET /api/jobs', () => {
    beforeEach(async () => {
        await JobDescription.create({
            userId: 'mock-user-id',
            title: 'Job 1',
            descriptionText: 'Description 1',
        });
        await JobDescription.create({
            userId: 'mock-user-id',
            title: 'Job 2',
            descriptionText: 'Description 2',
        });
        await JobDescription.create({
            userId: 'other-user-id',
            title: 'Other Job',
            descriptionText: 'Other Description',
        });
    });

    it('should return all jobs for the authenticated user', async () => {
        const response = await request(app).get('/api/jobs');

        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(2);
        expect(response.body[0].title).toBeDefined();
    });

    it('should return empty array if user has no jobs', async () => {
        await JobDescription.deleteMany({ userId: 'mock-user-id' });

        const response = await request(app).get('/api/jobs');

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual([]);
    });
});

describe('GET /api/jobs/:id', () => {
    let jobId;

    beforeEach(async () => {
        const job = await JobDescription.create({
            userId: 'mock-user-id',
            title: 'Test Job',
            descriptionText: 'Test Description',
        });
        jobId = job._id.toString();
    });

    it('should return a specific job by ID', async () => {
        const response = await request(app).get(`/api/jobs/${jobId}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.title).toBe('Test Job');
        expect(response.body._id).toBe(jobId);
    });

    it('should return 404 for non-existent job', async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();
        const response = await request(app).get(`/api/jobs/${fakeId}`);

        expect(response.statusCode).toBe(404);
    });

    it('should return 403 if job belongs to another user', async () => {
        const otherJob = await JobDescription.create({
            userId: 'other-user-id',
            title: 'Other Job',
            descriptionText: 'Other Description',
        });

        const response = await request(app).get(`/api/jobs/${otherJob._id}`);

        expect(response.statusCode).toBe(403);
    });
});

describe('PUT /api/jobs/:id', () => {
    let jobId;

    beforeEach(async () => {
        const job = await JobDescription.create({
            userId: 'mock-user-id',
            title: 'Original Title',
            descriptionText: 'Original Description',
        });
        jobId = job._id.toString();
    });

    it('should update a job successfully', async () => {
        const response = await request(app)
            .put(`/api/jobs/${jobId}`)
            .send({
                title: 'Updated Title',
                descriptionText: 'Updated Description',
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.title).toBe('Updated Title');
        expect(response.body.descriptionText).toBe('Updated Description');
    });

    it('should return 404 for non-existent job', async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();
        const response = await request(app)
            .put(`/api/jobs/${fakeId}`)
            .send({ title: 'Updated' });

        expect(response.statusCode).toBe(404);
    });

    it('should return 403 if updating another users job', async () => {
        const otherJob = await JobDescription.create({
            userId: 'other-user-id',
            title: 'Other Job',
            descriptionText: 'Other Description',
        });

        const response = await request(app)
            .put(`/api/jobs/${otherJob._id}`)
            .send({ title: 'Hacked Title' });

        expect(response.statusCode).toBe(403);
    });
});

describe('DELETE /api/jobs/:id', () => {
    let jobId;

    beforeEach(async () => {
        const job = await JobDescription.create({
            userId: 'mock-user-id',
            title: 'Job to Delete',
            descriptionText: 'Description',
        });
        jobId = job._id.toString();
    });

    it('should delete a job successfully', async () => {
        const response = await request(app).delete(`/api/jobs/${jobId}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toContain('deleted');

        const deletedJob = await JobDescription.findById(jobId);
        expect(deletedJob).toBeNull();
    });

    it('should return 404 for non-existent job', async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();
        const response = await request(app).delete(`/api/jobs/${fakeId}`);

        expect(response.statusCode).toBe(404);
    });

    it('should return 403 if deleting another users job', async () => {
        const otherJob = await JobDescription.create({
            userId: 'other-user-id',
            title: 'Other Job',
            descriptionText: 'Other Description',
        });

        const response = await request(app).delete(`/api/jobs/${otherJob._id}`);

        expect(response.statusCode).toBe(403);
    });
});
