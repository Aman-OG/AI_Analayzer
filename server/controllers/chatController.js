const { Groq } = require('groq-sdk');
const supabase = require('../config/supabaseClient');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const PRIMARY_MODEL = 'llama-3.3-70b-versatile';

/**
 * Handle chat queries about candidates for a specific job
 * POST /api/chat/:jobId
 */
const chatAboutCandidates = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { message, history } = req.body;
        const userId = req.user.id;

        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        // 1. Verify Job ownership
        const { data: job, error: jobError } = await supabase
            .from('job_descriptions')
            .select('title')
            .eq('id', jobId)
            .eq('user_id', userId)
            .single();

        if (jobError || !job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // 2. Fetch completed candidates for this job
        const { data: candidates, error: candidatesError } = await supabase
            .from('resumes')
            .select('candidate_name, score, tag_status, gemini_analysis')
            .eq('job_id', jobId)
            .eq('user_id', userId)
            .eq('processing_status', 'completed')
            .order('score', { ascending: false });

        if (candidatesError) {
            throw candidatesError;
        }

        if (!candidates || candidates.length === 0) {
            return res.status(200).json({
                success: true,
                reply: "You don't have any fully processed candidates for this position yet. Please upload some resumes first.",
            });
        }

        // 3. Prepare candidate context (condensed to save tokens)
        const candidatesContext = candidates.map(c => {
            const analysis = c.gemini_analysis || {};
            return {
                name: c.candidate_name,
                score: c.score,
                status: c.tag_status || 'applied',
                skills: analysis.skillsFound || [],
                missingSkills: analysis.missingSkills || [],
                experience: typeof analysis.yearsOfExperience === 'number' ? `${analysis.yearsOfExperience} years` : analysis.yearsOfExperience,
                education: analysis.education || 'Not specified',
                summary: analysis.justification || ''
            };
        });

        // 4. Construct System Prompt
        const systemPrompt = `You are "ResumeAI", an expert technical recruiter assistant. 
You are helping a recruiter evaluate candidates for the "${job.title}" position.

Below is the structured data for all candidates currently applying for this role.
Use ONLY this data to answer the recruiter's questions.

CANDIDATE DATA (JSON format):
${JSON.stringify(candidatesContext, null, 2)}

INSTRUCTIONS:
- Answer the recruiter's questions clearly, concisely, and accurately based on the data provided.
- If they ask for a recommendation, refer to the "score" and "skills".
- Use Markdown formatting for readability (e.g., bullet points, bold text).
- If the answer cannot be found in the candidate data, say "I don't have enough information in the candidate profiles to answer that."
- Do NOT hallucinate skills or candidates.`;

        // 5. Construct Messages Array
        const messages = [
            { role: 'system', content: systemPrompt },
            ...(history || []).map(msg => ({ role: msg.role, content: msg.content })),
            { role: 'user', content: message }
        ];

        // 6. Call Groq
        const chatCompletion = await groq.chat.completions.create({
            messages,
            model: PRIMARY_MODEL,
            temperature: 0.2, // Slightly creative but grounded
            max_completion_tokens: 1024,
        });

        const reply = chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

        res.status(200).json({
            success: true,
            reply,
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            success: false,
            message: 'Error communicating with AI assistant',
        });
    }
};

module.exports = {
    chatAboutCandidates,
};
