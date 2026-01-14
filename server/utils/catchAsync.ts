import { Request, Response, NextFunction } from 'express';

/**
 * Utility to wrap async functions and catch errors, passing them to next()
 */
const catchAsync = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(next);
    };
};

export default catchAsync;
