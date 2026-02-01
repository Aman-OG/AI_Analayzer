const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('❌ Missing GEMINI_API_KEY in environment variables');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

// Use gemini-1.5-flash with v1beta version for wider compatibility
const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-lite',
    apiVersion: 'v1beta'
});

// Log masked API key for debugging
const maskedKey = apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 4);
console.log(`✅ Gemini AI initialized with key: ${maskedKey}`);

module.exports = { genAI, model };
