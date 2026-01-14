import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import logger from '../utils/logger';

let genAI: GoogleGenerativeAI | null = null;
let generativeModel: GenerativeModel | null = null;

/**
 * Initializes the Google Gemini client and model.
 * Uses environment variables for the API Key.
 * 
 * @returns {{ genAI: GoogleGenerativeAI | null, generativeModel: GenerativeModel | null } | null}
 */
export const initGemini = (): { genAI: GoogleGenerativeAI | null; generativeModel: GenerativeModel | null } | null => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        logger.error('GEMINI_API_KEY missing in .env file');
        return null;
    }

    if (!genAI) {
        try {
            genAI = new GoogleGenerativeAI(apiKey);
            generativeModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            logger.info('Google Gemini client and model initialized (gemini-2.0-flash).');
        } catch (error: any) {
            logger.error("Failed to initialize Google Gemini client:", error);
            genAI = null;
            generativeModel = null;
        }
    }
    return { genAI, generativeModel };
};

/**
 * Retrieves the initialized Gemini model instance.
 * 
 * @returns {GenerativeModel | null}
 */
export const getGeminiModel = (): GenerativeModel | null => {
    if (!generativeModel) {
        logger.warn('Gemini model requested before initialization or initialization failed.');
        const initialized = initGemini();
        return initialized ? initialized.generativeModel : null;
    }
    return generativeModel;
};

/**
 * Retrieves the initialized Gemini client instance.
 * 
 * @returns {GoogleGenerativeAI | null}
 */
export const getGeminiClient = (): GoogleGenerativeAI | null => {
    if (!genAI) {
        logger.warn('Gemini client requested before initialization or initialization failed.');
        const initialized = initGemini();
        return initialized ? initialized.genAI : null;
    }
    return genAI;
};
