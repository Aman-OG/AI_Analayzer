import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError';

export interface ValidationRule {
    required?: boolean;
    type?: 'string' | 'array' | 'number' | 'object';
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
}

export type ValidationSchema = Record<string, ValidationRule>;

/**
 * Middleware to validate request data against a schema
 * @param {ValidationSchema} schema - Object containing validation rules
 * @param {string} [source='body'] - Request property to validate (body, query, params)
 */
const validate = (schema: ValidationSchema, source: 'body' | 'query' | 'params' = 'body') => {
    return (req: Request, res: Response, next: NextFunction) => {
        const data = (req as any)[source];
        const errors: string[] = [];

        Object.keys(schema).forEach(key => {
            const rules = schema[key];
            const value = data[key];

            if (rules.required && (value === undefined || value === null || value === '')) {
                errors.push(`${key} is required`);
                return;
            }

            if (value !== undefined && value !== null) {
                if (rules.type === 'string' && typeof value !== 'string') {
                    errors.push(`${key} must be a string`);
                }
                if (rules.type === 'array' && !Array.isArray(value)) {
                    errors.push(`${key} must be an array`);
                }
                if (rules.type === 'number' && typeof value !== 'number') {
                    errors.push(`${key} must be a number`);
                }
                if (rules.minLength && String(value).length < rules.minLength) {
                    errors.push(`${key} must be at least ${rules.minLength} characters`);
                }
                if (rules.maxLength && String(value).length > rules.maxLength) {
                    errors.push(`${key} must be at most ${rules.maxLength} characters`);
                }
                if (rules.pattern && !rules.pattern.test(value)) {
                    errors.push(`${key} is invalid`);
                }
            }
        });

        if (errors.length > 0) {
            return next(new AppError(`Validation failed: ${errors.join(', ')}`, 400));
        }

        next();
    };
};

export default validate;
