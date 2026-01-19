const { getSupabase } = require('../config/supabaseClient');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const logger = require('../utils/logger');

/**
 * @desc    Register/Sign up a new user
 * @route   POST /api/auth/signup
 * @access  Public
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const signupUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const supabase = getSupabase();

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  if (!supabase) {
    return next(new AppError('Supabase client not initialized', 500));
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    if (error.message.includes("User already registered")) {
      return next(new AppError("User already registered with this email.", 409));
    }
    return next(new AppError(error.message, 400));
  }

  if (data.user && !data.session && supabase.auth.settings?.mailer?.autoconfirm !== true) {
    return res.status(201).json({
      message: "Signup successful! Please check your email to confirm your account.",
      userId: data.user.id
    });
  } else if (data.user && data.session) {
    return res.status(201).json({
      message: "Signup successful!",
      user: data.user,
      session: data.session
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
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const supabase = getSupabase();

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  if (!supabase) {
    return next(new AppError('Supabase client not initialized', 500));
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message === "Invalid login credentials") {
      return next(new AppError("Invalid login credentials", 401));
    }
    if (error.message.includes("Email not confirmed")) {
      return next(new AppError("Email not confirmed. Please check your inbox.", 401));
    }
    return next(new AppError(error.message, 400));
  }

  res.status(200).json({
    message: "Login successful!",
    user: data.user,
    session: data.session
  });
});

/**
 * @desc    Get current user details
 * @route   GET /api/auth/user
 * @access  Private
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const getUser = catchAsync(async (req, res, next) => {
  if (req.user) {
    res.status(200).json(req.user);
  } else {
    return next(new AppError("Not authorized, user data not found", 401));
  }
});

/**
 * @desc    Log out user
 * @route   POST /api/auth/logout
 * @access  Private
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const logoutUser = catchAsync(async (req, res, next) => {
  const supabase = getSupabase();
  if (!supabase) {
    return next(new AppError('Supabase client not initialized', 500));
  }

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return next(new AppError('Not authorized, no token', 401));
  }

  const { error } = await supabase.auth.signOut(token);

  if (error) {
    logger.error('Supabase signout error', { error: error.message });
  }

  res.status(200).json({ message: 'Logout successful' });
});

/**
 * @desc    Refresh authentication token
 * @route   POST /api/auth/refresh
 * @access  Public
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const refreshToken = catchAsync(async (req, res, next) => {
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

module.exports = {
  signupUser,
  loginUser,
  getUser,
  logoutUser,
  refreshToken,
};