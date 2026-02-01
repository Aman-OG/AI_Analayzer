const mongoose = require('mongoose');

const jobDescriptionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Job title is required'],
            trim: true,
        },
        company: {
            type: String,
            trim: true,
        },
        descriptionText: {
            type: String,
            required: [true, 'Job description is required'],
        },
        mustHaveSkills: {
            type: [String],
            default: [],
        },
        focusAreas: {
            type: [String],
            default: [],
        },
        userId: {
            type: String,
            required: [true, 'User ID is required'],
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient user queries
jobDescriptionSchema.index({ userId: 1, createdAt: -1 });

const JobDescription = mongoose.model('JobDescription', jobDescriptionSchema);

module.exports = JobDescription;
