const { Groq } = require('groq-sdk');
const Resume = require('../models/ResumeModel');
const geminiQueue = require('../utils/GeminiQueue'); // We'll adapt the queue name later or reuse it

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Use Llama 3 70B for high quality analysis
const PRIMARY_MODEL = 'llama-3.3-70b-versatile';
const FALLBACK_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

/**
 * Construct detailed prompt for Groq/Llama analysis
 * @param {string} jobDescriptionText - Job description
 * @param {string} resumeText - Resume text
 * @param {Array<string>} mustHaveSkills - Required skills
 * @param {Array<string>} focusAreas - Focus areas
 * @returns {string} Formatted prompt
 */
const constructPrompt = (jobDescriptionText, resumeText, mustHaveSkills = [], focusAreas = []) => {
    const mustHaveSection = mustHaveSkills.length > 0
        ? `\n\n**MUST-HAVE SKILLS (if provided):** ${mustHaveSkills.join(', ')}\nThe presence or absence of these skills should significantly impact the fitScore. Note missing must-haves in 'warnings'.`
        : '';

    const focusSection = focusAreas.length > 0
        ? `\n\n**KEY FOCUS AREAS (if provided):** ${focusAreas.join(', ')}\nEvaluate experience related to these more heavily.`
        : '';

    return `Analyze the following resume against the provided job description.
Your goal is to extract specific information, evaluate the candidate's fit, and provide a score.

**IMPORTANT INSTRUCTIONS:**
1. RESPOND ONLY IN VALID JSON FORMAT. Do not include any text outside the JSON structure.
2. EXPLICITLY EXCLUDE ALL OTHER PERSONALLY IDENTIFIABLE INFORMATION (PII) EXCEPT THE NAME. This includes: email, phone, address, social media, photos. Use placeholders like "[REDACTED FOR PII]" for these other fields.
3. EXTRACT THE CANDIDATE'S FULL NAME from the resume header (usually the largest text at the top). If not found, use null. DO NOT use the filename or placeholders.
4. VALIDATE THE DOCUMENT: Determine if this document is actually a resume, CV, or professional profile. If it is school material, a textbook chapter, student notes, or anything else that is not a job application document, set "isResume" to false.
5. The 'fitScore' should be an integer between 1 (very poor fit) and 10 (excellent fit).
6. 'yearsExperience' should be estimated years of relevant experience (number, range like '3-5', or '10+').
7. 'skills' should list skills relevant to the job description found in the resume.
8. 'education' should list qualifications with the actual institution name.
9. 'justification' should explain the fitScore, highlighting strengths/weaknesses.
10. Differentiate between keyword stuffing vs genuine experience depth.
11. Include 'warnings' array for missing critical skills or ambiguities.

**JSON OUTPUT STRUCTURE:**
{
  "isResume": "boolean",
  "candidateName": "string or null",
  "skills": ["string"],
  "yearsExperience": "number or string",
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "graduationYear": "string or null"
    }
  ],
  "fitScore": "number (1-10)",
  "technicalFit": "number (1-10)",
  "experienceMatch": "number (1-10)",
  "educationLevel": "number (1-10)",
  "justification": "string",
  "warnings": ["string"],
  "interviewQuestions": ["string"]
}

**JOB DESCRIPTION:**
---
${jobDescriptionText}
---

**RESUME TEXT:**
---
${resumeText}
---${mustHaveSection}${focusSection}

**Now, provide your analysis in the specified JSON format only:**`;
};

/**
 * Call Groq API with fallback logic
 * @param {string} prompt - The prompt to send
 * @param {boolean} useFallback - Whether to use the fallback model
 * @returns {Promise<Object>} Parsed analysis
 */
const analyzeWithGroq = async (prompt, useFallback = false) => {
    const model = useFallback ? FALLBACK_MODEL : PRIMARY_MODEL;
    console.log(`🤖 Analyzing with Groq Model: ${model}`);

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: model,
            temperature: 0.1, // Low temperature for consistent JSON
            max_completion_tokens: useFallback ? 1024 : 4096, // Adjust tokens for fallback
            response_format: { type: "json_object" } // Force JSON mode if available
        });

        let text = chatCompletion.choices[0]?.message?.content || '';

        // Strip markdown code fences if present (just in case)
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');

        // Extract JSON between first { and last }
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');

        if (firstBrace === -1 || lastBrace === -1) {
            throw new Error('No JSON object found in response');
        }

        const jsonText = text.substring(firstBrace, lastBrace + 1);
        const analysis = JSON.parse(jsonText);

        // Validate required fields
        if (!analysis.fitScore || !analysis.justification) {
            throw new Error('Missing required fields: fitScore or justification');
        }

        return analysis;
    } catch (error) {
        console.error(`❌ Error with model ${model}:`, error.message);

        // If primary model fails, try fallback
        if (!useFallback) {
            console.log(`⚠️ Switching to fallback model: ${FALLBACK_MODEL}`);
            return analyzeWithGroq(prompt, true);
        }

        // If fallback also fails, throw error
        throw error;
    }
};

/**
 * Scan for PII in analysis results and redact (reused logic)
 * @param {Object} analysis - Analysis object
 * @returns {Object} Sanitized analysis with warnings
 */
const scanForPII = (analysis) => {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/gi;
    const phoneRegex = /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;

    const warnings = analysis.warnings || [];

    // Redact emails and phones from skills array
    if (analysis.skills && Array.isArray(analysis.skills)) {
        analysis.skills = analysis.skills.map(skill => {
            let cleaned = skill.replace(emailRegex, '[EMAIL REDACTED]');
            cleaned = cleaned.replace(phoneRegex, '[PHONE REDACTED]');
            return cleaned;
        });
    }

    if (analysis.education && Array.isArray(analysis.education)) {
        analysis.education.forEach(edu => {
            if (edu.institution) {
                if (emailRegex.test(edu.institution) || phoneRegex.test(edu.institution)) {
                    warnings.push('PII detected in education institution field');
                }
            }
        });
    }

    if (analysis.justification) {
        if (emailRegex.test(analysis.justification) || phoneRegex.test(analysis.justification)) {
            warnings.push('PII detected in justification field');
        }
    }

    analysis.warnings = warnings;
    return analysis;
};

/**
 * Trigger Groq analysis for a resume (queued)
 * @param {string} resumeId - Resume document ID
 */
const triggerGroqAnalysis = async (resumeId) => {
    // Reuse existing queue mechanism
    await geminiQueue.add(async () => {
        try {
            console.log(`🔄 Starting analysis for resume (Groq): ${resumeId}`);

            // Update status to processing
            const resume = await Resume.findById(resumeId).populate('jobId');
            if (!resume) {
                throw new Error('Resume not found');
            }

            resume.processingStatus = 'processing';
            await resume.save();

            // Get job description
            const job = resume.jobId;
            if (!job) {
                throw new Error('Job description not found');
            }

            // Construct prompt
            const prompt = constructPrompt(
                job.descriptionText,
                resume.extractedText,
                job.mustHaveSkills,
                job.focusAreas
            );

            // Update status to scoring
            resume.processingStatus = 'scoring';
            await resume.save();

            // Call Groq API
            const analysis = await analyzeWithGroq(prompt);

            // Update status to finalizing
            resume.processingStatus = 'finalizing';
            await resume.save();

            // Scan for PII
            const sanitizedAnalysis = scanForPII(analysis);

            // Check Document Validation
            if (sanitizedAnalysis.isResume === false) {
                resume.processingStatus = 'error';
                resume.errorDetails = 'Rejected: This document does not appear to be a resume (AI Validation Failed).';
                await resume.save();
                console.log(`❌ Analysis rejected (Not a resume): ${resumeId}`);
                return;
            }

            // Update resume with results
            resume.geminiAnalysis = {
                skills: sanitizedAnalysis.skills || [],
                yearsExperience: sanitizedAnalysis.yearsExperience || null,
                education: sanitizedAnalysis.education || [],
                fitScore: sanitizedAnalysis.fitScore,
                technicalFit: sanitizedAnalysis.technicalFit || null,
                experienceMatch: sanitizedAnalysis.experienceMatch || null,
                educationLevel: sanitizedAnalysis.educationLevel || null,
                justification: sanitizedAnalysis.justification,
                warnings: sanitizedAnalysis.warnings || [],
                interviewQuestions: sanitizedAnalysis.interviewQuestions || [],
            };
            resume.candidateName = sanitizedAnalysis.candidateName || null;
            resume.score = sanitizedAnalysis.fitScore;
            resume.processingStatus = 'completed';
            resume.errorDetails = null;

            await resume.save();
            console.log(`✅ Analysis completed for resume: ${resumeId} (Score: ${resume.score})`);

        } catch (error) {
            console.error(`❌ Analysis failed for resume ${resumeId}:`, error.message);

            // Update resume with error
            const resume = await Resume.findById(resumeId);
            if (resume) {
                resume.processingStatus = 'error';
                resume.errorDetails = error.message;
                await resume.save();
            }

            // Re-throw to let queue handle it
            throw error;
        }
    });
};

module.exports = {
    triggerGroqAnalysis
};
