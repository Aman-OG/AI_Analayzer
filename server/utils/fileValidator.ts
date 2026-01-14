import path from 'path';

/**
 * Server-side file validation utilities
 * Provides comprehensive validation for uploaded resume files
 */

export const FILE_VALIDATION = {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB in bytes
    MIN_SIZE: 1024, // 1KB minimum
    ALLOWED_EXTENSIONS: ['.pdf', '.doc', '.docx'],
    ALLOWED_MIME_TYPES: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
};

const FILE_SIGNATURES = {
    PDF: Buffer.from([0x25, 0x50, 0x44, 0x46]), // %PDF
    DOC: Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]), // DOC (OLE2)
    DOCX: Buffer.from([0x50, 0x4b, 0x03, 0x04]), // DOCX (ZIP)
};

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

export function validateFileSize(fileSize: number): ValidationResult {
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

export function validateFileExtension(filename: string): ValidationResult {
    const ext = path.extname(filename).toLowerCase();

    if (!FILE_VALIDATION.ALLOWED_EXTENSIONS.includes(ext)) {
        return {
            isValid: false,
            error: `Invalid file extension. Only ${FILE_VALIDATION.ALLOWED_EXTENSIONS.join(', ')} files are allowed.`,
        };
    }

    return { isValid: true };
}

export function validateMimeType(mimetype: string): ValidationResult {
    if (!FILE_VALIDATION.ALLOWED_MIME_TYPES.includes(mimetype)) {
        return {
            isValid: false,
            error: 'Invalid file type. Only PDF, DOC, and DOCX files are supported.',
        };
    }

    return { isValid: true };
}

export function validateFileSignature(fileBuffer: Buffer, filename: string): ValidationResult {
    if (!fileBuffer || fileBuffer.length < 8) {
        return {
            isValid: false,
            error: 'File is corrupted or incomplete.',
        };
    }

    const ext = path.extname(filename).toLowerCase();
    const firstBytes = fileBuffer.subarray(0, 8);

    if (ext === '.pdf') {
        if (firstBytes.subarray(0, 4).equals(FILE_SIGNATURES.PDF)) {
            return { isValid: true };
        }
        return {
            isValid: false,
            error: 'File extension is .pdf but file content does not match PDF format.',
        };
    }

    if (ext === '.doc') {
        if (firstBytes.equals(FILE_SIGNATURES.DOC)) {
            return { isValid: true };
        }
        return {
            isValid: false,
            error: 'File extension is .doc but file content does not match DOC format.',
        };
    }

    if (ext === '.docx') {
        if (firstBytes.subarray(0, 4).equals(FILE_SIGNATURES.DOCX)) {
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

export function validateFileName(filename: string): ValidationResult {
    if (filename.includes('\0')) {
        return {
            isValid: false,
            error: 'File name contains invalid characters.',
        };
    }

    if (filename.length > 255) {
        return {
            isValid: false,
            error: 'File name is too long (max 255 characters).',
        };
    }

    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return {
            isValid: false,
            error: 'File name contains invalid path characters.',
        };
    }

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

export function validateResumeFile(file: any): ValidationResult {
    const nameValidation = validateFileName(file.originalname);
    if (!nameValidation.isValid) return nameValidation;

    const sizeValidation = validateFileSize(file.size);
    if (!sizeValidation.isValid) return sizeValidation;

    const extensionValidation = validateFileExtension(file.originalname);
    if (!extensionValidation.isValid) return extensionValidation;

    const mimeValidation = validateMimeType(file.mimetype);
    if (!mimeValidation.isValid) return mimeValidation;

    const signatureValidation = validateFileSignature(file.buffer, file.originalname);
    if (!signatureValidation.isValid) return signatureValidation;

    return { isValid: true };
}

export function checkForMaliciousContent(fileBuffer: Buffer): ValidationResult {
    const content = fileBuffer.toString('utf8', 0, Math.min(fileBuffer.length, 1024));

    if (content.includes('<script') || content.includes('javascript:')) {
        return {
            isValid: false,
            error: 'File contains potentially malicious content.',
        };
    }

    const executableSignatures = [
        Buffer.from([0x4d, 0x5a]), // MZ (Windows executable)
        Buffer.from([0x7f, 0x45, 0x4c, 0x46]), // ELF (Linux executable)
    ];

    for (const signature of executableSignatures) {
        if (fileBuffer.subarray(0, signature.length).equals(signature)) {
            return {
                isValid: false,
                error: 'File appears to be an executable, which is not allowed.',
            };
        }
    }

    return { isValid: true };
}
