/**
 * Validation Schemas for API Requests
 */

const jobSchemas = {
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

const authSchemas = {
    signup: {
        email: { type: 'string', required: true, pattern: /^\S+@\S+\.\S+$/ },
        password: { type: 'string', required: true, minLength: 6 },
    },
    login: {
        email: { type: 'string', required: true, pattern: /^\S+@\S+\.\S+$/ },
        password: { type: 'string', required: true },
    }
};

const resumeSchemas = {
    upload: {
        jobId: { type: 'string', required: true },
    }
};

module.exports = {
    jobSchemas,
    authSchemas,
    resumeSchemas,
};
