import { ValidationSchema } from '../middleware/validationMiddleware';

export const jobSchemas: Record<string, ValidationSchema> = {
    create: {
        title: { type: 'string', required: true, minLength: 3, maxLength: 100 },
        descriptionText: { type: 'string', required: true, minLength: 10 },
        mustHaveSkills: { type: 'array' },
        focusAreas: { type: 'array' },
    },
    update: {
        title: { type: 'string', minLength: 3, maxLength: 100 },
        descriptionText: { type: 'string', minLength: 10 },
        mustHaveSkills: { type: 'array' },
        focusAreas: { type: 'array' },
    }
};

export const authSchemas: Record<string, ValidationSchema> = {
    signup: {
        email: { type: 'string', required: true, pattern: /^\S+@\S+\.\S+$/ },
        password: { type: 'string', required: true, minLength: 6 },
    },
    login: {
        email: { type: 'string', required: true, pattern: /^\S+@\S+\.\S+$/ },
        password: { type: 'string', required: true },
    }
};

export const resumeSchemas: Record<string, ValidationSchema> = {
    upload: {
        jobId: { type: 'string', required: true },
    }
};
