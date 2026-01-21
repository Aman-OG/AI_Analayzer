import { getGeminiModel } from '../config/gemini';
import Resume, { IGeminiAnalysis } from '../models/ResumeModel';
import JobDescription from '../models/JobDescriptionModel';
import logger from '../utils/logger';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Constructs the prompt for Gemini API.
 */
export const constructPrompt = (
    resumeText: string,
    jobDescriptionText: string,
    mustHaveSkills: string[] = [],
    focusAreas: string[] = []
): string => {
    let prompt = `
    Analyze the following resume against the provided job description.
    Your goal is to extract specific information, evaluate the candidate's fit, and provide a score.

    **IMPORTANT INSTRUCTIONS:**
    1.  **RESPOND ONLY IN VALID JSON FORMAT.** Do not include any text outside the JSON structure.
    2.  **EXPLICITLY EXCLUDE ALL PERSONALLY IDENTIFIABLE INFORMATION (PII)**. This includes but is not limited to: name, email address, phone number, physical address, social media links, photos, or any other data that can directly identify an individual. If PII is found in fields like 'skills' or 'education', please omit or generalize it. For example, instead of "John Doe University", use "a university". **If PII cannot be adequately anonymized or generalized within a specific data point (e.g., a skill that is a person's name, or an educational institution that is too specific and unique), use a placeholder like \"[REDACTED FOR PII]\" for that specific data point, or omit the data point if the entire field would be PII.**
    3.  The 'fitScore' should be an integer between 1 (very poor fit) and 10 (excellent fit).
    4.  'yearsExperience' should be an estimated number of years of relevant experience based on the job description. It can be a number (e.g., 5), a range (e.g., '3-5'), a string like '10+', or null if not determinable.
    5.  'skills' should be a list of skills relevant to the job description found in the resume.
    6.  'education' should be a list of educational qualifications.
    7.  'justification' should be a concise explanation for the given 'fitScore', highlighting key strengths or weaknesses relative to the job description.
    8.  **Keyword Evaluation:** Differentiate between a resume that merely lists many keywords and one that demonstrates genuine application of those skills through described experiences and achievements. The depth and context of experience are more important than the sheer number of keyword mentions when determining the score and justification.
    9.  **Warnings Field:** If you identify specific critical skills from the job description that are clearly missing in the resume, or if there are ambiguities that prevent a full assessment, include a brief note in the 'warnings' array within the JSON.

    **JSON OUTPUT STRUCTURE (Strictly Adhere to this format):**
    \`\`\`json
    {
      "skills": ["string"],
      "yearsExperience": "number (e.g., 5) or string (e.g., '0-2', '10+'), or null if not determinable",
      "education": [
        {
          "degree": "string (e.g., 'Bachelor of Science in Computer Science')",
          "institution": "string (e.g., 'a well-known university' - ANONYMIZED)",
          "graduationYear": "string (e.g., '2020' or null)"
        }
      ],
      "fitScore": "number (integer 1-10)",
      "justification": "string",
      "warnings": ["string"]
    }
    \`\`\`

    **JOB DESCRIPTION:**
    ---
    ${jobDescriptionText}
    ---

    **RESUME TEXT:**
    ---
    ${resumeText}
    ---
    `;

    if (mustHaveSkills.length > 0) {
        prompt += `\n\n**MUST-HAVE SKILLS (Pay special attention):** ${mustHaveSkills.join(', ')}. The presence or absence of these skills should significantly impact the fitScore and justification. If any of these must-have skills are missing, please note this in the 'warnings' array.`;
    }
    if (focusAreas.length > 0) {
        prompt += `\n\n**KEY FOCUS AREAS (Evaluate experience related to these more heavily):** ${focusAreas.join(', ')}.`;
    }

    prompt += "\n\n**Now, provide your analysis in the specified JSON format only:**";
    return prompt;
};

/**
 * Analyzes resume and job description using Gemini API.
 */
export const analyzeWithGemini = async (
    resumeText: string,
    jobDescriptionText: string,
    mustHaveSkills: string[] = [],
    focusAreas: string[] = []
): Promise<IGeminiAnalysis> => {
    const model = getGeminiModel();
    if (!model) {
        throw new Error('Gemini model not initialized.');
    }

    const prompt = constructPrompt(resumeText, jobDescriptionText, mustHaveSkills, focusAreas);

    const generationConfig = {
        maxOutputTokens: 2048,
        temperature: 0.3,
    };

    logger.info("Sending prompt to Gemini", { promptLength: prompt.length });

    let attempt = 0;
    while (attempt < MAX_RETRIES) {
        try {
            const result = await model.generateContent(prompt, generationConfig);
            const response = await result.response;
            const responseText = response.text();

            let cleanedJsonText = responseText.trim();
            if (cleanedJsonText.startsWith("```json")) {
                cleanedJsonText = cleanedJsonText.substring(7);
            }
            if (cleanedJsonText.endsWith("```")) {
                cleanedJsonText = cleanedJsonText.substring(0, cleanedJsonText.length - 3);
            }
            cleanedJsonText = cleanedJsonText.trim();

            const jsonStartMarker = '{';
            const jsonEndMarker = '}';
            const startIndex = cleanedJsonText.indexOf(jsonStartMarker);
            const endIndex = cleanedJsonText.lastIndexOf(jsonEndMarker);

            if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
                throw new Error("Gemini response does not contain valid JSON object markers.");
            }

            const potentialJson = cleanedJsonText.substring(startIndex, endIndex + 1);
            const parsedResponse = JSON.parse(potentialJson);

            // Basic validation of parsed response
            if (typeof parsedResponse.fitScore === 'undefined') {
                throw new Error('fitScore is missing in Gemini response');
            }

            return parsedResponse as IGeminiAnalysis;

        } catch (error: any) {
            // DETECT QUOTA EXCEEDED (429)
            if (error.message?.includes('429') || error.status === 429) {
                logger.error(`Gemini Quota Exceeded for attempt ${attempt + 1}. Stopping retries.`);
                throw new Error('Gemini AI Quota Exceeded. Please try again later.');
            }

            logger.error(`Gemini API call attempt ${attempt + 1} failed`, {
                attempt: attempt + 1,
                error: error.message
            });
            attempt++;
            if (attempt >= MAX_RETRIES) {
                throw new Error(`Gemini API call failed after ${MAX_RETRIES} attempts: ${error.message}`);
            }
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (attempt + 1)));
        }
    }
    throw new Error("Gemini analysis failed after all retries.");
};

/**
 * Triggers the Gemini analysis for a given resume ID.
 */
export const triggerGeminiAnalysis = async (resumeId: string): Promise<void> => {
    logger.info(`Starting analysis for resumeId: ${resumeId}`, { resumeId });
    let resumeDoc;
    try {
        resumeDoc = await Resume.findById(resumeId);
        if (!resumeDoc) {
            logger.error(`Resume not found for ID: ${resumeId}`, { resumeId });
            return;
        }

        if (resumeDoc.processingStatus === 'completed' || resumeDoc.processingStatus === 'processing') {
            logger.info(`Resume ${resumeId} is already ${resumeDoc.processingStatus}. Skipping re-analysis.`, {
                resumeId,
                status: resumeDoc.processingStatus
            });
            return;
        }

        const jobDoc = await JobDescription.findById(resumeDoc.jobId);
        if (!jobDoc) {
            logger.error(`JobDescription not found for jobId: ${resumeDoc.jobId}`, {
                resumeId,
                jobId: resumeDoc.jobId
            });
            await resumeDoc.updateOne({
                processingStatus: 'error',
                errorDetails: 'Associated job description not found.',
            });
            return;
        }

        await resumeDoc.updateOne({ processingStatus: 'processing', errorDetails: null });

        const analysisResult = await analyzeWithGemini(
            resumeDoc.extractedText || '',
            jobDoc.descriptionText,
            jobDoc.mustHaveSkills || [],
            jobDoc.focusAreas || []
        );

        // --- PII Scanning and Redaction ---
        let updatedAnalysisResult: IGeminiAnalysis = JSON.parse(JSON.stringify(analysisResult));
        let systemWarnings = updatedAnalysisResult.warnings || [];

        const piiPatterns = [
            { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/gi, type: "Email" },
            { pattern: /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, type: "Phone" },
        ];

        if (updatedAnalysisResult.skills && Array.isArray(updatedAnalysisResult.skills)) {
            updatedAnalysisResult.skills = updatedAnalysisResult.skills.map(skill => {
                let cleanedSkill = skill;
                piiPatterns.forEach(p => {
                    if (p.pattern.test(skill)) {
                        const warningMsg = `System: Potential PII (${p.type}) detected and redacted from skill.`;
                        if (!systemWarnings.includes(warningMsg)) systemWarnings.push(warningMsg);
                        cleanedSkill = cleanedSkill.replace(p.pattern, `[REDACTED ${p.type}]`);
                    }
                    p.pattern.lastIndex = 0;
                });
                return cleanedSkill;
            });
        }

        if (updatedAnalysisResult.education && Array.isArray(updatedAnalysisResult.education)) {
            updatedAnalysisResult.education.forEach(edu => {
                if (edu.institution && typeof edu.institution === 'string') {
                    piiPatterns.forEach(p => {
                        if (p.pattern.test(edu.institution)) {
                            const warningMsg = `System: Potential PII (${p.type}) detected in education institution.`;
                            if (!systemWarnings.includes(warningMsg)) systemWarnings.push(warningMsg);
                        }
                        p.pattern.lastIndex = 0;
                    });
                }
            });
        }

        if (updatedAnalysisResult.justification && typeof updatedAnalysisResult.justification === 'string') {
            piiPatterns.forEach(p => {
                if (p.pattern.test(updatedAnalysisResult.justification)) {
                    const warningMsg = `System: Potential PII (${p.type}) detected in 'justification'.`;
                    if (!systemWarnings.includes(warningMsg)) systemWarnings.push(warningMsg);
                }
                p.pattern.lastIndex = 0;
            });
        }
        updatedAnalysisResult.warnings = Array.from(new Set(systemWarnings));

        await resumeDoc.updateOne({
            geminiAnalysis: updatedAnalysisResult,
            score: Number(updatedAnalysisResult.fitScore) || 0,
            processingStatus: 'completed',
            errorDetails: null,
        });

        logger.info(`Analysis completed successfully for resumeId: ${resumeId}`, {
            resumeId,
            score: updatedAnalysisResult.fitScore
        });

    } catch (error: any) {
        logger.error(`Error during Gemini analysis for resumeId ${resumeId}`, {
            resumeId,
            error: error.message
        });

        if (resumeDoc) {
            await resumeDoc.updateOne({
                processingStatus: 'error',
                errorDetails: error.message || "Unknown processing error",
            }).catch(updateErr => logger.error(`Failed to update resume ${resumeId} to error state: ${updateErr.message}`));
        }
    }
};
