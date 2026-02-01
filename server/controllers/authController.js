const supabase = require('../config/supabaseClient');

/**
 * Sign up a new user
 * POST /api/auth/signup
 */
const signup = async (req, res) => {
    try {
        const { email, password, fullName } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required',
            });
        }

        // Create user with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName || '',
                },
            },
        });

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: data.user,
            session: data.session,
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during signup',
        });
    }
};

/**
 * Login a user
 * POST /api/auth/login
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required',
            });
        }

        // Sign in with Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return res.status(401).json({
                success: false,
                message: error.message,
            });
        }

        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: data.user,
            session: data.session,
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
        });
    }
};

module.exports = {
    signup,
    login,
};
