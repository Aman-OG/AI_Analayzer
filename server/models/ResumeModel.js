const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobDescription',
        required: true,
        index: true
    },
    userId: {
        type: String,
        required: [true, 'User ID is required'],
        index: true
    },
    originalFilename: {
        type: String,
        required: [true, 'Filename is required']
    },
    candidateName: {
        type: String,
        index: true
    },
    fileType: {
        type: String,
        enum: ['pdf', 'docx'],
        required: true
    },
    fileHash: {
        type: String,
        index: true
    },
    supabaseFileUrl: {
        type: String,
        required: true
    },
    extractedText: {
        type: String
    },
    processingStatus: {
        type: String,
        enum: ['uploaded', 'parsing', 'processing', 'scoring', 'finalizing', 'completed', 'failed', 'error'],
        default: 'processing',
        index: true
    },
    score: {
        type: Number,
        default: 0,
        index: true
    },
    geminiAnalysis: {
        type: mongoose.Schema.Types.Mixed
    },
    tagStatus: {
        type: String,
        enum: ['applied', 'shortlisted', 'interviewed', 'rejected'],
        default: 'applied',
        index: true
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    uploadTimestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Resume', ResumeSchema);
