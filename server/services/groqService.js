const { Groq } = require('groq-sdk');
const supabase = require('../config/supabaseClient');
const { redactPII } = require('../utils/piiRedactor');
const requestQueue = require('../utils/RequestQueue');

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

**Instructions for evaluation:**
1. Compare the candidate's skills, experience, and education against the job description.
2. The candidate's text has been pre-redacted for PII to prevent bias.
3. Be highly objective and critical. Provide a realistic score (1-10).
4. Identify missing critical skills as "red flags".
5. Extract the candidate's name if visible, otherwise return "Unknown Candidate".

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

const safeParseJSON = (text) => {
    try {
        return JSON.parse(text);
    } catch (e1) {
        try {
            const stripped = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            return JSON.parse(stripped);
        } catch (e2) {
            try {
                const firstBrace = text.indexOf('{');
                const lastBrace = text.lastIndexOf('}');
                if (firstBrace !== -1 && lastBrace !== -1) {
                    const jsonText = text.substring(firstBrace, lastBrace + 1);
                    return JSON.parse(jsonText);
                }
            } catch (e3) {
                // fall through to error
            }
        }
        throw new Error('AI returned an invalid JSON structure that could not be repaired.');
    }
};

/**
 * Call Groq API with fallback logic
 * @param {string} prompt - The prompt to send
 * @param {boolean} useFallback - Whether to use the fallback model
 * @param {number} retries - Number of retries for parsing errors
 * @returns {Promise<Object>} Parsed analysis
 */
const analyzeWithGroq = async (prompt, useFallback = false, retries = 1) => {
    const model = useFallback ? FALLBACK_MODEL : PRIMARY_MODEL;
    console.log(`🤖 Analyzing with Groq Model: ${model}`);

    try {
        // Add abort controller for timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => {
            controller.abort();
        }, 45000); // 45 seconds timeout

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
        }, { signal: controller.signal });

        clearTimeout(timeout);

        let text = chatCompletion.choices[0]?.message?.content || '';
        
        const analysis = safeParseJSON(text);

        // Validate required fields
        if (!analysis.fitScore || !analysis.justification) {
            throw new Error('Missing required fields: fitScore or justification');
        }

        // Clamp fitScore
        if (typeof analysis.fitScore === 'number') {
            analysis.fitScore = Math.max(1, Math.min(10, analysis.fitScore));
        } else {
             analysis.fitScore = 5; // fallback
        }

        return analysis;
    } catch (error) {
        console.error(`❌ Error with model ${model}:`, error.message);

        // Retry on parsing errors or timeout
        if ((error.message.includes('JSON') || error.name === 'AbortError') && retries > 0) {
             console.log(`⚠️ Retrying analysis due to parsing/timeout error. Retries left: ${retries - 1}`);
             return analyzeWithGroq(prompt, useFallback, retries - 1);
        }

        // If primary model fails, try fallback
        if (!useFallback) {
            console.log(`⚠️ Switching to fallback model: ${FALLBACK_MODEL}`);
            return analyzeWithGroq(prompt, true, 1);
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
    await requestQueue.add(async () => {
        try {
            console.log(`🔄 Starting analysis for resume (Groq): ${resumeId}`);

            // Update status to processing
            const { data: resume, error: resumeError } = await supabase
                .from('resumes')
                .select(`
                    *,
                    job_descriptions (*)
                `)
                .eq('id', resumeId)
                .single();

            if (resumeError || !resume) {
                throw new Error('Resume not found');
            }

            await supabase.from('resumes').update({ processing_status: 'processing' }).eq('id', resumeId);

            // Get job description
            const job = resume.job_descriptions;
            if (!job) {
                throw new Error('Job description not found');
            }

            // 4. Redact PII from the extracted text
            console.log(`🛡️ Redacting PII for resume ${resumeId}...`);
            const { redactedText, extractedPII } = redactPII(resume.extracted_text);

            // Construct prompt
            const prompt = constructPrompt(
                job.description_text,
                redactedText,
                job.must_have_skills,
                job.focus_areas
            );

            // Update status to scoring
            await supabase.from('resumes').update({ processing_status: 'scoring' }).eq('id', resumeId);

            // Call Groq API
            const analysis = await analyzeWithGroq(prompt);

            // Update status to finalizing
            await supabase.from('resumes').update({ processing_status: 'finalizing' }).eq('id', resumeId);

            // Scan for PII
            const sanitizedAnalysis = scanForPII(analysis);

            // Check Document Validation
            if (sanitizedAnalysis.isResume === false) {
                await supabase.from('resumes').update({
                    processing_status: 'error',
                    gemini_analysis: { errorDetails: 'Rejected: This document does not appear to be a resume (AI Validation Failed).' }
                }).eq('id', resumeId);
                console.log(`❌ Analysis rejected (Not a resume): ${resumeId}`);
                return;
            }

            // Update resume with results
            const aiAnalysis = {
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

            await supabase.from('resumes').update({
                gemini_analysis: aiAnalysis,
                candidate_name: sanitizedAnalysis.candidateName || extractedPII.assumedName || 'Unknown Candidate',
                score: sanitizedAnalysis.fitScore,
                processing_status: 'completed'
            }).eq('id', resumeId);
            
            console.log(`✅ Analysis completed for resume: ${resumeId} (Score: ${sanitizedAnalysis.fitScore})`);

        } catch (error) {
            console.error(`❌ Analysis failed for resume ${resumeId}:`, error.message);

            // Update resume with error
            await supabase.from('resumes').update({
                processing_status: 'error',
                gemini_analysis: { errorDetails: error.message }
            }).eq('id', resumeId);

            // Re-throw to let queue handle it
            throw error;
        }
    });
};

/**
 * Generate a comprehensive interview guide for the top candidates using Groq
 * @param {Object} job - Job description object
 * @param {Array<Object>} candidates - List of candidate objects
 * @returns {Promise<string>} Markdown formatted interview guide
 */
const generateInterviewGuide = async (job, candidates) => {
    try {
        const candidateSummaries = candidates.map((c, i) => {
            const analysis = c.aiAnalysis || c.geminiAnalysis || c.analysis || {};
            const warnings = Array.isArray(analysis.warnings) ? analysis.warnings : [];
            const skills = Array.isArray(analysis.skills) ? analysis.skills : [];
            return `
CANDIDATE ${i + 1}: ${c.candidateName || c.originalFilename}
FIT SCORE: ${c.score}/10
STRENGTHS: ${analysis.justification || 'N/A'}
GAPS/WARNINGS: ${warnings.join(', ') || 'None'}
SKILLS: ${skills.join(', ') || 'N/A'}
`;
        }).join('\n---\n');

        const prompt = `You are an expert technical recruiter and hiring manager.
Generate a structured, professional Interview Guide for the following position based on the top candidate's profiles.

JOB TITLE: ${job.title}
COMPANY: ${job.company || 'Internal'}
JOB DESCRIPTION SUMMARY:
${job.descriptionText ? job.descriptionText.substring(0, 500) : ''}...

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

        console.log(`🤖 Generating Interview Guide with Groq Model: ${PRIMARY_MODEL}`);
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: PRIMARY_MODEL,
            temperature: 0.5,
            max_completion_tokens: 2048,
        });

        return chatCompletion.choices[0]?.message?.content || '';
    } catch (error) {
        console.error('Groq Interview Guide error:', error.message);
        throw error;
    }
};

module.exports = {
    triggerGroqAnalysis,
    generateInterviewGuide
};
