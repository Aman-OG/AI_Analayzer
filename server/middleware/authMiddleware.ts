import { Request, Response, NextFunction } from 'express';
import { getSupabase } from '../config/supabaseClient';
import logger from '../utils/logger';

/**
 * Middleware to protect routes by verifying the Supabase JWT.
 * Attaches the user object to the request if validation succeeds.
 */
export const protect = async (req: any, res: Response, next: NextFunction) => {
    let token: string | undefined;
    const supabase = getSupabase();

    if (!supabase) {
        logger.error('Auth middleware: Supabase client not initialized');
        return res.status(500).json({ message: 'Internal server error: Auth service unavailable' });
    }

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const { data: { user }, error } = await supabase.auth.getUser(token);

            if (error) {
                logger.warn(`Auth middleware: Supabase token validation error: ${error.message}`);
                return res.status(401).json({ message: 'Not authorized, token validation failed' });
            }

            if (!user) {
                return res.status(401).json({ message: 'Not authorized, user not found for token' });
            }

            req.user = {
                id: user.id,
                email: user.email,
            };

            next();
        } catch (error: any) {
            logger.error('Auth middleware error:', error);
            res.status(401).json({ message: 'Not authorized, token processing failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};
