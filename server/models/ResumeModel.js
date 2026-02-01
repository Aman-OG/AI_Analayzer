const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
    {
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'JobDescription',
            required: [true, 'Job ID is required'],
            index: true,
        },
        userId: {
            type: String,
            required: [true, 'User ID is required'],
            index: true,
        },
        originalFilename: {
            type: String,
            required: true,
        },
        fileType: {
            type: String,
            enum: ['pdf', 'docx'],
            required: true,
        },
        supabaseFileUrl: {
            type: String,
            required: true,
        },
        extractedText: {
            type: String,
            required: true,
        },
        uploadTimestamp: {
            type: Date,
            default: Date.now,
        },
        processingStatus: {
            type: String,
            enum: ['uploaded', 'processing', 'completed', 'error'],
            default: 'uploaded',
            index: true,
        },
        errorDetails: {
            type: String,
            default: null,
        },
        score: {
            type: Number,
            min: 0,
            max: 10,
            default: null,
        },
        geminiAnalysis: {
            skills: {
                type: [String],
                default: [],
            },
            yearsExperience: {
                type: mongoose.Schema.Types.Mixed, // Can be Number, String like '3-5', '10+'
                default: null,
            },
            education: [
                {
                    degree: String,
                    institution: String,
                    graduationYear: String,
                },
            ],
            fitScore: {
                type: Number,
                min: 1,
                max: 10,
                default: null,
            },
            justification: {
                type: String,
                default: null,
            },
            warnings: {
                type: [String],
                default: [],
            },
        },
    },
    {
        timestamps: true,
    }
);

// Compound indexes for efficient queries
resumeSchema.index({ jobId: 1, score: -1 });
resumeSchema.index({ jobId: 1, uploadTimestamp: -1 });
resumeSchema.index({ userId: 1, processingStatus: 1 });

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume;
