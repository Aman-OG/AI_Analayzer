import mongoose, { Schema, Document } from 'mongoose';

export interface IGeminiAnalysis {
    skills: string[];
    yearsExperience: string | number | null;
    education: Array<{
        degree: string;
        institution: string;
        graduationYear: string | null;
    }>;
    fitScore: number;
    justification: string;
    warnings: string[];
}

export interface IResume extends Document {
    userId: string;
    jobId: mongoose.Types.ObjectId;
    originalFilename: string;
    fileType: string;
    uploadTimestamp: Date;
    processingStatus: 'uploaded' | 'extracting' | 'processing' | 'completed' | 'error';
    extractedText?: string;
    geminiAnalysis?: IGeminiAnalysis;
    score?: number;
    errorDetails?: string;
    createdAt: Date;
    updatedAt: Date;
}

const resumeSchema: Schema = new Schema(
    {
        userId: {
            type: String, // Store Supabase user ID (UUID)
            required: true,
        },
        jobId: {
            type: mongoose.Schema.Types.ObjectId, // Link to a JobDescription model
            ref: 'JobDescription',
            required: true,
        },
        originalFilename: {
            type: String,
            required: true,
        },
        fileType: { // Mime type
            type: String,
            required: true,
        },
        uploadTimestamp: {
            type: Date,
            default: Date.now,
        },
        processingStatus: {
            type: String,
            enum: ['uploaded', 'extracting', 'processing', 'completed', 'error'],
            default: 'uploaded',
        },
        extractedText: {
            type: String,
        },
        geminiAnalysis: {
            type: mongoose.Schema.Types.Mixed,
        },
        score: {
            type: Number,
        },
        errorDetails: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

resumeSchema.index({ userId: 1, jobId: 1 });
resumeSchema.index({ jobId: 1, processingStatus: 1 });

const Resume = mongoose.model<IResume>('Resume', resumeSchema);

export default Resume;
