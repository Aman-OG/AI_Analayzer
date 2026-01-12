const AppError = require('../utils/appError');

/**
 * Middleware to validate request data against a schema
 * @param {Object} schema - Object containing validation rules
 * @param {string} [source='body'] - Request property to validate (body, query, params)
 */
const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        const data = req[source];
        const errors = [];

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
                if (rules.minLength && value.length < rules.minLength) {
                    errors.push(`${key} must be at least ${rules.minLength} characters`);
                }
                if (rules.maxLength && value.length > rules.maxLength) {
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

module.exports = validate;
