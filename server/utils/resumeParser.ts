import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import logger from './logger';

/**
 * Extracts raw text from a file buffer based on its MIME type.
 * Supports PDF and Word documents (.doc, .docx).
 * 
 * @param {Buffer} fileBuffer - The buffer containing the file data.
 * @param {string} mimeType - The MIME type of the file.
 * @returns {Promise<string>} - The extracted text.
 * @throws {Error} - If the file type is unsupported or extraction fails.
 */
export const extractTextFromBuffer = async (fileBuffer: Buffer, mimeType: string): Promise<string> => {
    try {
        if (mimeType === 'application/pdf') {
            const data = await pdf(fileBuffer);
            return data.text;
        } else if (
            mimeType === 'application/msword' || // .doc
            mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
        ) {
            const { value } = await mammoth.extractRawText({ buffer: fileBuffer });
            return value;
        } else {
            throw new Error('Unsupported file type for text extraction.');
        }
    } catch (error: any) {
        logger.error('Error extracting text:', { error: error.message, mimeType });
        throw error;
    }
};
