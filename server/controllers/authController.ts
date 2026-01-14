import { Request, Response, NextFunction } from 'express';
import { getSupabase } from '../config/supabaseClient';
import catchAsync from '../utils/catchAsync';
import logger from '../utils/logger';
import AppError from '../utils/appError';

/**
 * @desc    Register/Sign up a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const signupUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const supabase = getSupabase();
    if (!supabase) {
        return next(new AppError('Auth service unavailable', 501));
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        logger.error('Supabase signup error', { error: error.message });
        return next(new AppError(error.message, 400));
    }

    if (data?.user && data?.session) {
        res.status(201).json({
            status: 'success',
            data: {
                user: {
                    id: data.user.id,
                    email: data.user.email,
                },
                session: {
                    access_token: data.session.access_token,
                    refresh_token: data.session.refresh_token,
                    expires_at: data.session.expires_at,
                },
            },
        });
    } else {
        logger.error("Supabase signup response anomaly", { data });
        return next(new AppError("Signup completed but session data is unavailable. Please try logging in or check email confirmation.", 500));
    }
});

/**
 * @desc    Authenticate/Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const supabase = getSupabase();
    if (!supabase) {
        return next(new AppError('Auth service unavailable', 501));
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        logger.error('Supabase login error', { error: error.message });
        return next(new AppError(error.message, 401));
    }

    const { session, user } = data;

    res.status(200).json({
        status: 'success',
        data: {
            user: {
                id: user.id,
                email: user.email,
            },
            session: {
                access_token: session.access_token,
                refresh_token: session.refresh_token,
                expires_at: session.expires_at,
            },
        },
    });
});

/**
 * @desc    Get current user details
 * @route   GET /api/auth/user
 * @access  Private
 */
export const getUser = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    if (req.user) {
        res.status(200).json(req.user);
    } else {
        return next(new AppError('Not authenticated', 401));
    }
});

/**
 * @desc    Log out user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logoutUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const supabase = getSupabase();
    if (!supabase) {
        return next(new AppError('Auth service unavailable', 501));
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
        logger.error('Supabase signout error', { error: error.message });
    }
    res.status(200).json({ message: 'Logout successful' });
});

/**
 * @desc    Refresh authentication token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
export const refreshToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { refresh_token } = req.body;

    if (!refresh_token) {
        return next(new AppError('Refresh token is required.', 400));
    }

    const supabase = getSupabase();
    if (!supabase) {
        return next(new AppError('Auth service unavailable', 501));
    }

    const { data, error } = await supabase.auth.refreshSession({ refresh_token });

    if (error) {
        logger.error('Token refresh failed', { error: error.message });
        return next(new AppError(error.message, 401));
    }

    const { session, user } = data;

    if (!session || !user) {
        return next(new AppError('Session refresh failed', 401));
    }

    res.status(200).json({
        status: 'success',
        data: {
            user: {
                id: user.id,
                email: user.email,
            },
            session: {
                access_token: session.access_token,
                refresh_token: session.refresh_token,
                expires_at: session.expires_at,
            },
        },
    });
});
