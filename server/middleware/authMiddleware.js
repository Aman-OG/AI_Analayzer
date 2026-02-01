const supabase = require('../config/supabaseClient');

/**
 * Middleware to verify JWT token from Supabase
 * Attaches user info to req.user
 */
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No authorization token provided'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            console.log('❌ Auth Error:', error?.message || 'User not found');
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        // Attach user to request
        req.user = user;
        next();

    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication error'
        });
    }
};

module.exports = authMiddleware;
