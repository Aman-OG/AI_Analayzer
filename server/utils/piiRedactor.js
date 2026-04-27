/**
 * Redacts Personally Identifiable Information (PII) from resume text
 * to prevent bias during AI evaluation.
 * 
 * @param {string} text - The raw extracted resume text
 * @returns {Object} { redactedText, extractedPII }
 */
const redactPII = (text) => {
    if (!text || typeof text !== 'string') {
        return { redactedText: text, extractedPII: {} };
    }

    let redactedText = text;
    const extractedPII = {
        emails: [],
        phones: [],
    };

    // 1. Redact Emails
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    const foundEmails = redactedText.match(emailRegex);
    if (foundEmails) {
        extractedPII.emails = [...new Set(foundEmails)];
        redactedText = redactedText.replace(emailRegex, '[EMAIL REDACTED]');
    }

    // 2. Redact Phone Numbers
    // Matches common formats: (123) 456-7890, 123-456-7890, +1 123 456 7890, etc.
    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const foundPhones = redactedText.match(phoneRegex);
    if (foundPhones) {
        extractedPII.phones = [...new Set(foundPhones)];
        redactedText = redactedText.replace(phoneRegex, '[PHONE REDACTED]');
    }

    // 3. Redact Social URLs (except LinkedIn/GitHub which are professional)
    const socialRegex = /(https?:\/\/)?(www\.)?(facebook|instagram|twitter|x|tiktok)\.com\/[a-zA-Z0-9_-]+/gi;
    redactedText = redactedText.replace(socialRegex, '[SOCIAL URL REDACTED]');

    // 4. Redact Gender/Title indicators
    const titleRegex = /\b(Mr\.|Mrs\.|Ms\.|Miss)\b/gi;
    redactedText = redactedText.replace(titleRegex, '[TITLE REDACTED]');

    // 5. Redact Candidate Name (Usually the very first line of a resume)
    // We'll strip the first non-empty line and replace it
    const lines = redactedText.split('\n');
    let nameFound = false;
    for (let i = 0; i < Math.min(10, lines.length); i++) {
        const line = lines[i].trim();
        // Look for a line that looks like a name (2-3 words, no numbers, not too long)
        if (line.length > 3 && line.length < 50 && !/\d/.test(line) && line.split(' ').length >= 2 && line.split(' ').length <= 4) {
             // If we haven't found a name yet, treat this as the name
             if(!nameFound) {
                 extractedPII.assumedName = line;
                 lines[i] = '[CANDIDATE NAME REDACTED]';
                 nameFound = true;
             }
        }
    }
    redactedText = lines.join('\n');

    return { redactedText, extractedPII };
};

module.exports = { redactPII };
