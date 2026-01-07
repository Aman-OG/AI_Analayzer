// server/controllers/authController.test.js
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const authRoutes = require('../routes/authRoutes');

// Mock Supabase client
const mockSupabaseAuth = {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    getUser: jest.fn(),
};

jest.mock('../config/supabaseClient', () => ({
    getSupabase: jest.fn(() => ({
        auth: mockSupabaseAuth,
    })),
}));

let mongoServer;
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(() => {
    mockSupabaseAuth.signUp.mockClear();
    mockSupabaseAuth.signInWithPassword.mockClear();
    mockSupabaseAuth.signOut.mockClear();
    mockSupabaseAuth.getUser.mockClear();
});

describe('POST /api/auth/signup', () => {
    it('should create a new user successfully', async () => {
        mockSupabaseAuth.signUp.mockResolvedValue({
            data: {
                user: { id: 'user-123', email: 'test@example.com' },
                session: { access_token: 'token-123' },
            },
            error: null,
        });

        const response = await request(app)
            .post('/api/auth/signup')
            .send({
                email: 'test@example.com',
                password: 'password123',
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.user).toBeDefined();
        expect(response.body.user.email).toBe('test@example.com');
        expect(mockSupabaseAuth.signUp).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'password123',
        });
    });

    it('should return 400 if email is missing', async () => {
        const response = await request(app)
            .post('/api/auth/signup')
            .send({ password: 'password123' });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toContain('Email and password');
    });

    it('should return 400 if password is missing', async () => {
        const response = await request(app)
            .post('/api/auth/signup')
            .send({ email: 'test@example.com' });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toContain('Email and password');
    });

    it('should return 400 if signup fails', async () => {
        mockSupabaseAuth.signUp.mockResolvedValue({
            data: { user: null, session: null },
            error: { message: 'Email already registered' },
        });

        const response = await request(app)
            .post('/api/auth/signup')
            .send({
                email: 'existing@example.com',
                password: 'password123',
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toContain('Email already registered');
    });
});

describe('POST /api/auth/login', () => {
    it('should login user successfully', async () => {
        mockSupabaseAuth.signInWithPassword.mockResolvedValue({
            data: {
                user: { id: 'user-123', email: 'test@example.com' },
                session: { access_token: 'token-123' },
            },
            error: null,
        });

        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123',
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.user).toBeDefined();
        expect(response.body.session).toBeDefined();
        expect(mockSupabaseAuth.signInWithPassword).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'password123',
        });
    });

    it('should return 400 for invalid credentials', async () => {
        mockSupabaseAuth.signInWithPassword.mockResolvedValue({
            data: { user: null, session: null },
            error: { message: 'Invalid login credentials' },
        });

        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'wrong@example.com',
                password: 'wrongpassword',
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toContain('Invalid login credentials');
    });

    it('should return 400 if email is missing', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({ password: 'password123' });

        expect(response.statusCode).toBe(400);
    });
});

describe('POST /api/auth/logout', () => {
    it('should logout user successfully', async () => {
        mockSupabaseAuth.signOut.mockResolvedValue({
            error: null,
        });

        const response = await request(app)
            .post('/api/auth/logout')
            .set('Authorization', 'Bearer token-123');

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toContain('Logged out successfully');
    });

    it('should return error if logout fails', async () => {
        mockSupabaseAuth.signOut.mockResolvedValue({
            error: { message: 'Logout failed' },
        });

        const response = await request(app)
            .post('/api/auth/logout')
            .set('Authorization', 'Bearer token-123');

        expect(response.statusCode).toBe(400);
    });
});
