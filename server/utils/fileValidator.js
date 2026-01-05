// server/utils/fileValidator.js

/**
 * Server-side file validation utilities
 * Provides comprehensive validation for uploaded resume files
 */

const path = require('path');

// File validation constants
const FILE_VALIDATION = {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB in bytes
    MIN_SIZE: 1024, // 1KB minimum
    ALLOWED_EXTENSIONS: ['.pdf', '.doc', '.docx'],
    ALLOWED_MIME_TYPES: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
};

// File magic numbers (signatures) for verification
const FILE_SIGNATURES = {
    PDF: Buffer.from([0x25, 0x50, 0x44, 0x46]), // %PDF
    DOC: Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]), // DOC (OLE2)
    DOCX: Buffer.from([0x50, 0x4b, 0x03, 0x04]), // DOCX (ZIP)
};

/**
 * Validates file size
 * @param {number} fileSize - Size of the file in bytes
 * @returns {{isValid: boolean, error?: string}}
 */
function validateFileSize(fileSize) {
    if (fileSize > FILE_VALIDATION.MAX_SIZE) {
        const maxSizeMB = FILE_VALIDATION.MAX_SIZE / (1024 * 1024);
        const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
        return {
            isValid: false,
            error: `File size (${fileSizeMB}MB) exceeds maximum allowed size of ${maxSizeMB}MB.`,
        };
    }

    if (fileSize < FILE_VALIDATION.MIN_SIZE) {
        return {
            isValid: false,
            error: 'File is too small or appears to be empty.',
        };
    }

    return { isValid: true };
}

/**
 * Validates file extension
 * @param {string} filename - Name of the file
 * @returns {{isValid: boolean, error?: string}}
 */
function validateFileExtension(filename) {
    const ext = path.extname(filename).toLowerCase();

    if (!FILE_VALIDATION.ALLOWED_EXTENSIONS.includes(ext)) {
        return {
            isValid: false,
            error: `Invalid file extension. Only ${FILE_VALIDATION.ALLOWED_EXTENSIONS.join(', ')} files are allowed.`,
        };
    }

    return { isValid: true };
}

/**
 * Validates MIME type
 * @param {string} mimetype - MIME type of the file
 * @returns {{isValid: boolean, error?: string}}
 */
function validateMimeType(mimetype) {
    if (!FILE_VALIDATION.ALLOWED_MIME_TYPES.includes(mimetype)) {
        return {
            isValid: false,
            error: 'Invalid file type. Only PDF, DOC, and DOCX files are supported.',
        };
    }

    return { isValid: true };
}

/**
 * Validates file signature (magic number)
 * Checks the first bytes of the file to verify its actual type
 * @param {Buffer} fileBuffer - Buffer containing the file data
 * @param {string} filename - Name of the file (to determine expected type)
 * @returns {{isValid: boolean, error?: string}}
 */
function validateFileSignature(fileBuffer, filename) {
    if (!fileBuffer || fileBuffer.length < 8) {
        return {
            isValid: false,
            error: 'File is corrupted or incomplete.',
        };
    }

    const ext = path.extname(filename).toLowerCase();
    const firstBytes = fileBuffer.slice(0, 8);

    // Check PDF signature
    if (ext === '.pdf') {
        if (firstBytes.slice(0, 4).equals(FILE_SIGNATURES.PDF)) {
            return { isValid: true };
        }
        return {
            isValid: false,
            error: 'File extension is .pdf but file content does not match PDF format.',
        };
    }

    // Check DOC signature (OLE2 format)
    if (ext === '.doc') {
        if (firstBytes.equals(FILE_SIGNATURES.DOC)) {
            return { isValid: true };
        }
        return {
            isValid: false,
            error: 'File extension is .doc but file content does not match DOC format.',
        };
    }

    // Check DOCX signature (ZIP format)
    if (ext === '.docx') {
        if (firstBytes.slice(0, 4).equals(FILE_SIGNATURES.DOCX)) {
            return { isValid: true };
        }
        return {
            isValid: false,
            error: 'File extension is .docx but file content does not match DOCX format.',
        };
    }

    return {
        isValid: false,
        error: 'Unsupported file type.',
    };
}

/**
 * Validates file name for security issues
 * @param {string} filename - Name of the file
 * @returns {{isValid: boolean, error?: string}}
 */
function validateFileName(filename) {
    // Check for null bytes (security issue)
    if (filename.includes('\0')) {
        return {
            isValid: false,
            error: 'File name contains invalid characters.',
        };
    }

    // Check for excessively long file names
    if (filename.length > 255) {
        return {
            isValid: false,
            error: 'File name is too long (max 255 characters).',
        };
    }

    // Check for path traversal attempts
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return {
            isValid: false,
            error: 'File name contains invalid path characters.',
        };
    }

    // Check for suspicious double extensions
    const parts = filename.split('.');
    if (parts.length > 2) {
        const secondToLastExt = parts[parts.length - 2].toLowerCase();
        const suspiciousExtensions = ['exe', 'bat', 'cmd', 'sh', 'js', 'vbs', 'scr', 'php', 'asp'];

        if (suspiciousExtensions.includes(secondToLastExt)) {
            return {
                isValid: false,
                error: 'File name contains potentially dangerous extensions.',
            };
        }
    }

    return { isValid: true };
}

/**
 * Comprehensive file validation
 * Runs all validation checks
 * @param {Object} file - Multer file object
 * @returns {{isValid: boolean, error?: string}}
 */
function validateResumeFile(file) {
    // 1. Validate file name
    const nameValidation = validateFileName(file.originalname);
    if (!nameValidation.isValid) return nameValidation;

    // 2. Validate file size
    const sizeValidation = validateFileSize(file.size);
    if (!sizeValidation.isValid) return sizeValidation;

    // 3. Validate file extension
    const extensionValidation = validateFileExtension(file.originalname);
    if (!extensionValidation.isValid) return extensionValidation;

    // 4. Validate MIME type
    const mimeValidation = validateMimeType(file.mimetype);
    if (!mimeValidation.isValid) return mimeValidation;

    // 5. Validate file signature (magic number)
    const signatureValidation = validateFileSignature(file.buffer, file.originalname);
    if (!signatureValidation.isValid) return signatureValidation;

    return { isValid: true };
}

/**
 * Checks if file content appears to be malicious
 * Basic checks for suspicious patterns
 * @param {Buffer} fileBuffer - Buffer containing the file data
 * @returns {{isValid: boolean, error?: string}}
 */
function checkForMaliciousContent(fileBuffer) {
    const content = fileBuffer.toString('utf8', 0, Math.min(fileBuffer.length, 1024));

    // Check for script tags (shouldn't be in resume files)
    if (content.includes('<script') || content.includes('javascript:')) {
        return {
            isValid: false,
            error: 'File contains potentially malicious content.',
        };
    }

    // Check for executable signatures
    const executableSignatures = [
        Buffer.from([0x4d, 0x5a]), // MZ (Windows executable)
        Buffer.from([0x7f, 0x45, 0x4c, 0x46]), // ELF (Linux executable)
    ];

    for (const signature of executableSignatures) {
        if (fileBuffer.slice(0, signature.length).equals(signature)) {
            return {
                isValid: false,
                error: 'File appears to be an executable, which is not allowed.',
            };
        }
    }

    return { isValid: true };
}

module.exports = {
    validateResumeFile,
    validateFileSize,
    validateFileExtension,
    validateMimeType,
    validateFileSignature,
    validateFileName,
    checkForMaliciousContent,
    FILE_VALIDATION,
};
