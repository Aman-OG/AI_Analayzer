import mongoose, { Schema, Document } from 'mongoose';

export interface IJobDescription extends Document {
    userId: string;
    title: string;
    descriptionText: string;
    mustHaveSkills: string[];
    focusAreas: string[];
    createdAt: Date;
    updatedAt: Date;
}

const jobDescriptionSchema: Schema = new Schema(
    {
        userId: { // The user who created/owns this job description
            type: String, // Supabase user ID (UUID)
            required: true,
        },
        title: {
            type: String,
            required: [true, 'Job title is required.'],
            trim: true,
        },
        descriptionText: {
            type: String,
            required: [true, 'Job description text is required.'],
        },
        mustHaveSkills: {
            type: [String],
            default: [],
        },
        focusAreas: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

jobDescriptionSchema.index({ userId: 1 });

const JobDescription = mongoose.model<IJobDescription>('JobDescription', jobDescriptionSchema);

export default JobDescription;
