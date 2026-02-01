const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extract text from PDF buffer
 * @param {Buffer} buffer - PDF file buffer
 * @returns {Promise<string>} Extracted text
 */
const parsePDF = async (buffer) => {
    try {
        const data = await pdfParse(buffer);
        return data.text;
    } catch (error) {
        throw new Error(`PDF parsing failed: ${error.message}`);
    }
};

/**
 * Extract text from DOCX buffer
 * @param {Buffer} buffer - DOCX file buffer
 * @returns {Promise<string>} Extracted text
 */
const parseDOCX = async (buffer) => {
    try {
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
    } catch (error) {
        throw new Error(`DOCX parsing failed: ${error.message}`);
    }
};

/**
 * Parse resume file based on type
 * @param {Buffer} buffer - File buffer
 * @param {string} fileType - 'pdf' or 'docx'
 * @returns {Promise<string>} Extracted text
 */
const parseResume = async (buffer, fileType) => {
    if (fileType === 'pdf') {
        return await parsePDF(buffer);
    } else if (fileType === 'docx') {
        return await parseDOCX(buffer);
    } else {
        throw new Error(`Unsupported file type: ${fileType}`);
    }
};

module.exports = {
    parsePDF,
    parseDOCX,
    parseResume,
};
