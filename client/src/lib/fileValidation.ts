// src/lib/fileValidation.ts

/**
 * File validation utilities for resume uploads
 * Provides comprehensive client-side validation before upload
 */

// Constants for file validation
export const FILE_VALIDATION = {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB in bytes
    MIN_SIZE: 1024, // 1KB minimum
    ALLOWED_EXTENSIONS: ['.pdf', '.doc', '.docx'] as const,
    ALLOWED_MIME_TYPES: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ] as const,
} as const;

// File magic numbers (first bytes) for verification
const FILE_SIGNATURES = {
    PDF: [0x25, 0x50, 0x44, 0x46], // %PDF
    DOC: [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1], // DOC (OLE2)
    DOCX: [0x50, 0x4b, 0x03, 0x04], // DOCX (ZIP)
} as const;

export interface ValidationResult {
    isValid: boolean;
    error?: string;
    details?: string;
}

/**
 * Validates file size
 */
export function validateFileSize(file: File): ValidationResult {
    if (file.size > FILE_VALIDATION.MAX_SIZE) {
        const maxSizeMB = FILE_VALIDATION.MAX_SIZE / (1024 * 1024);
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        return {
            isValid: false,
            error: 'File too large',
            details: `File size is ${fileSizeMB}MB. Maximum allowed size is ${maxSizeMB}MB.`,
        };
    }

    if (file.size < FILE_VALIDATION.MIN_SIZE) {
        return {
            isValid: false,
            error: 'File too small',
            details: 'The file appears to be empty or corrupted.',
        };
    }

    return { isValid: true };
}

/**
 * Validates file extension
 */
export function validateFileExtension(file: File): ValidationResult {
    const fileName = file.name.toLowerCase();
    const hasValidExtension = FILE_VALIDATION.ALLOWED_EXTENSIONS.some((ext) =>
        fileName.endsWith(ext)
    );

    if (!hasValidExtension) {
        return {
            isValid: false,
            error: 'Invalid file type',
            details: `Only ${FILE_VALIDATION.ALLOWED_EXTENSIONS.join(', ')} files are allowed.`,
        };
    }

    return { isValid: true };
}

/**
 * Validates MIME type
 */
export function validateMimeType(file: File): ValidationResult {
    if (!FILE_VALIDATION.ALLOWED_MIME_TYPES.includes(file.type as any)) {
        return {
            isValid: false,
            error: 'Invalid MIME type',
            details: 'The file type is not supported. Please upload a PDF, DOC, or DOCX file.',
        };
    }

    return { isValid: true };
}

/**
 * Reads the first few bytes of a file to verify its signature (magic number)
 * This provides additional security beyond MIME type checking
 */
export async function validateFileSignature(file: File): Promise<ValidationResult> {
    try {
        // Read first 8 bytes (enough for all our file types)
        const arrayBuffer = await file.slice(0, 8).arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);

        // Check for PDF signature
        if (matchesSignature(bytes, FILE_SIGNATURES.PDF)) {
            return { isValid: true };
        }

        // Check for DOC signature (OLE2 format)
        if (matchesSignature(bytes, FILE_SIGNATURES.DOC)) {
            return { isValid: true };
        }

        // Check for DOCX signature (ZIP format)
        if (matchesSignature(bytes, FILE_SIGNATURES.DOCX)) {
            return { isValid: true };
        }

        return {
            isValid: false,
            error: 'File signature mismatch',
            details: 'The file content does not match its extension. The file may be corrupted or renamed.',
        };
    } catch (error) {
        console.error('Error reading file signature:', error);
        return {
            isValid: false,
            error: 'Unable to read file',
            details: 'Could not verify file integrity. Please try again.',
        };
    }
}

/**
 * Helper function to match byte signatures
 */
function matchesSignature(bytes: Uint8Array, signature: readonly number[]): boolean {
    if (bytes.length < signature.length) return false;

    for (let i = 0; i < signature.length; i++) {
        if (bytes[i] !== signature[i]) return false;
    }

    return true;
}

/**
 * Validates file name for suspicious patterns
 */
export function validateFileName(file: File): ValidationResult {
    const fileName = file.name;

    // Check for null bytes (potential security issue)
    if (fileName.includes('\0')) {
        return {
            isValid: false,
            error: 'Invalid file name',
            details: 'File name contains invalid characters.',
        };
    }

    // Check for excessively long file names
    if (fileName.length > 255) {
        return {
            isValid: false,
            error: 'File name too long',
            details: 'File name must be less than 255 characters.',
        };
    }

    // Check for suspicious double extensions (e.g., resume.pdf.exe)
    const parts = fileName.split('.');
    if (parts.length > 2) {
        const secondToLastExt = parts[parts.length - 2].toLowerCase();
        const suspiciousExtensions = ['exe', 'bat', 'cmd', 'sh', 'js', 'vbs', 'scr'];

        if (suspiciousExtensions.includes(secondToLastExt)) {
            return {
                isValid: false,
                error: 'Suspicious file name',
                details: 'File name contains potentially dangerous extensions.',
            };
        }
    }

    return { isValid: true };
}

/**
 * Comprehensive file validation
 * Runs all validation checks and returns the first error found
 */
export async function validateResumeFile(file: File): Promise<ValidationResult> {
    // 1. Validate file name
    const nameValidation = validateFileName(file);
    if (!nameValidation.isValid) return nameValidation;

    // 2. Validate file size
    const sizeValidation = validateFileSize(file);
    if (!sizeValidation.isValid) return sizeValidation;

    // 3. Validate file extension
    const extensionValidation = validateFileExtension(file);
    if (!extensionValidation.isValid) return extensionValidation;

    // 4. Validate MIME type
    const mimeValidation = validateMimeType(file);
    if (!mimeValidation.isValid) return mimeValidation;

    // 5. Validate file signature (magic number)
    const signatureValidation = await validateFileSignature(file);
    if (!signatureValidation.isValid) return signatureValidation;

    return { isValid: true };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
