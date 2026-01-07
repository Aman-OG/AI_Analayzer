// server/middleware/authMiddleware.test.js
const { protect } = require('./authMiddleware');

// Mock Supabase client
const mockSupabaseAuth = {
    getUser: jest.fn(),
};

jest.mock('../config/supabaseClient', () => ({
    getSupabase: jest.fn(() => ({
        auth: mockSupabaseAuth,
    })),
}));

describe('Auth Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
        mockSupabaseAuth.getUser.mockClear();
    });

    describe('protect middleware', () => {
        it('should allow request with valid token', async () => {
            req.headers.authorization = 'Bearer valid-token';
            mockSupabaseAuth.getUser.mockResolvedValue({
                data: {
                    user: { id: 'user-123', email: 'test@example.com' },
                },
                error: null,
            });

            await protect(req, res, next);

            expect(req.user).toBeDefined();
            expect(req.user.id).toBe('user-123');
            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should reject request without authorization header', async () => {
            await protect(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.stringContaining('No token'),
                })
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should reject request with malformed authorization header', async () => {
            req.headers.authorization = 'InvalidFormat token';

            await protect(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });

        it('should reject request with invalid token', async () => {
            req.headers.authorization = 'Bearer invalid-token';
            mockSupabaseAuth.getUser.mockResolvedValue({
                data: { user: null },
                error: { message: 'Invalid token' },
            });

            await protect(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.stringContaining('Invalid token'),
                })
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should handle Supabase errors gracefully', async () => {
            req.headers.authorization = 'Bearer token';
            mockSupabaseAuth.getUser.mockRejectedValue(new Error('Supabase error'));

            await protect(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });
    });
});
