const mongoose = require('mongoose');

const JobDescriptionSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    title: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true
    },
    company: {
        type: String,
        trim: true
    },
    descriptionText: {
        type: String,
        required: [true, 'Job description is required']
    },
    mustHaveSkills: {
        type: [String],
        default: []
    },
    focusAreas: {
        type: [String],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('JobDescription', JobDescriptionSchema);
