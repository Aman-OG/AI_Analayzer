const { model } = require('../config/gemini');
const Resume = require('../models/ResumeModel');
const JobDescription = require('../models/JobDescriptionModel');
const geminiQueue = require('../utils/GeminiQueue');

/**
 * Construct detailed prompt for Gemini analysis
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
2. EXPLICITLY EXCLUDE ALL PERSONALLY IDENTIFIABLE INFORMATION (PII) EXCEPT THE NAME. This includes: email, phone, address, social media, photos. Use placeholders like "[REDACTED FOR PII]" if needed.
3. EXTRACT THE CANDIDATE'S FULL NAME from the resume. If not found, use null.
4. The 'fitScore' should be an integer between 1 (very poor fit) and 10 (excellent fit).
5. 'yearsExperience' should be estimated years of relevant experience (number, range like '3-5', or '10+').
6. 'skills' should list skills relevant to the job description found in the resume.
7. 'education' should list qualifications with anonymized institutions.
8. 'justification' should explain the fitScore, highlighting strengths/weaknesses.
9. Differentiate between keyword stuffing vs genuine experience depth.
10. Include 'warnings' array for missing critical skills or ambiguities.

**JSON OUTPUT STRUCTURE:**
{
  "candidateName": "string or null",
  "skills": ["string"],
  "yearsExperience": "number or string",
  "education": [
    {
      "degree": "string",
      "institution": "string (anonymized)",
      "graduationYear": "string or null"
    }
  ],
  "fitScore": "number (1-10)",
  "justification": "string",
  "warnings": ["string"]
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
 * Call Gemini API and parse response
 * @param {string} prompt - The prompt to send
 * @returns {Promise<Object>} Parsed analysis
 */
const analyzeWithGemini = async (prompt) => {
    try {
        if (!model) {
            throw new Error('Gemini API key is not configured');
        }
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Strip markdown code fences if present
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
        console.error('Gemini API error:', error.message);
        throw error;
    }
};

/**
 * Scan for PII in analysis results and redact
 * @param {Object} analysis - Gemini analysis object
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

    // Check for PII in education institutions (add warning, don't auto-redact)
    if (analysis.education && Array.isArray(analysis.education)) {
        analysis.education.forEach(edu => {
            if (edu.institution) {
                if (emailRegex.test(edu.institution) || phoneRegex.test(edu.institution)) {
                    warnings.push('PII detected in education institution field');
                }
            }
        });
    }

    // Check for PII in justification (add warning, don't auto-redact to preserve readability)
    if (analysis.justification) {
        if (emailRegex.test(analysis.justification) || phoneRegex.test(analysis.justification)) {
            warnings.push('PII detected in justification field');
        }
    }

    analysis.warnings = warnings;
    return analysis;
};

/**
 * Trigger Gemini analysis for a resume (queued)
 * @param {string} resumeId - Resume document ID
 */
const triggerGeminiAnalysis = async (resumeId) => {
    // Wrap entire analysis in queue
    await geminiQueue.add(async () => {
        try {
            console.log(`🔄 Starting analysis for resume: ${resumeId}`);

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

            // Call Gemini API
            const analysis = await analyzeWithGemini(prompt);

            // Scan for PII
            const sanitizedAnalysis = scanForPII(analysis);

            // Update resume with results
            resume.geminiAnalysis = {
                skills: sanitizedAnalysis.skills || [],
                yearsExperience: sanitizedAnalysis.yearsExperience || null,
                education: sanitizedAnalysis.education || [],
                fitScore: sanitizedAnalysis.fitScore,
                justification: sanitizedAnalysis.justification,
                warnings: sanitizedAnalysis.warnings || [],
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

                // Check if it's a daily quota error
                if (error.message.includes('Daily API Quota Exceeded')) {
                    resume.errorDetails = 'Daily API Quota Exceeded. Please try again tomorrow.';
                } else {
                    resume.errorDetails = error.message;
                }

                await resume.save();
            }

            // Re-throw to let queue handle it
            throw error;
        }
    });
};

/**
 * Generate a comprehensive interview guide for the top candidates
 * @param {Object} job - Job description object
 * @param {Array<Object>} candidates - List of candidate objects
 * @returns {Promise<string>} Markdown formatted interview guide
 */
const generateInterviewGuide = async (job, candidates) => {
    try {
        if (!model) {
            throw new Error('Gemini API key is not configured');
        }
        const candidateSummaries = candidates.map((c, i) => {
            const analysis = c.geminiAnalysis || c.analysis;
            return `
CANDIDATE ${i + 1}: ${c.candidateName || c.originalFilename}
FIT SCORE: ${c.score}/10
STRENGTHS: ${analysis.justification}
GAPS/WARNINGS: ${analysis.warnings.join(', ') || 'None'}
SKILLS: ${analysis.skills.join(', ')}
`;
        }).join('\n---\n');

        const prompt = `You are an expert technical recruiter and hiring manager.
Generate a structured, professional Interview Guide for the following position based on the top candidate's profiles.

JOB TITLE: ${job.title}
COMPANY: ${job.company || 'Internal'}
JOB DESCRIPTION SUMMARY:
${job.descriptionText.substring(0, 500)}...

TOP CANDIDATES DATA:
${candidateSummaries}

---
INSTRUCTIONS:
1. Provide a 'General Interview Strategy' for this specific role.
2. For EACH candidate, provide:
   - 3-4 Targeted Interview Questions specifically designed to probe their 'Gaps/Warnings' or verify high-impact skills.
   - What to look for in their answers (ideal response patterns).
   - A 'Deep Dive' technical topic unique to their background.
3. Include a 'Comparative Analysis' section at the end to help the interviewer choose between them.
4. Format the entire response in clean Markdown.
5. DO NOT include PII. Use the candidate names as provided.

Respond ONLY with the Markdown content.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini Interview Guide error:', error.message);
        throw error;
    }
};

module.exports = {
    constructPrompt,
    analyzeWithGemini,
    scanForPII,
    triggerGeminiAnalysis,
    generateInterviewGuide,
};
