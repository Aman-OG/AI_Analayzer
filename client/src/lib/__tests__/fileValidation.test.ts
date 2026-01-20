// src/lib/__tests__/fileValidation.test.ts
import { describe, it, expect } from 'vitest';
import {
    validateFileSize,
    validateFileExtension,
    validateMimeType,
    validateFileSignature,
    validateFileName,
    validateResumeFile,
    formatFileSize,
    FILE_VALIDATION,
} from '../fileValidation';

describe('File Validation', () => {
    describe('validateFileSize', () => {
        it('should pass for valid file size', () => {
            const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
            Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB

            const result = validateFileSize(file);
            expect(result.isValid).toBe(true);
        });

        it('should fail for file too large', () => {
            const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
            Object.defineProperty(file, 'size', { value: 10 * 1024 * 1024 }); // 10MB

            const result = validateFileSize(file);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('File too large');
        });

        it('should fail for file too small', () => {
            const file = new File([''], 'test.pdf', { type: 'application/pdf' });
            Object.defineProperty(file, 'size', { value: 500 }); // 500 bytes

            const result = validateFileSize(file);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('File too small');
        });
    });

    describe('validateFileExtension', () => {
        it('should pass for .pdf extension', () => {
            const file = new File(['test'], 'resume.pdf', { type: 'application/pdf' });
            const result = validateFileExtension(file);
            expect(result.isValid).toBe(true);
        });

        it('should pass for .doc extension', () => {
            const file = new File(['test'], 'resume.doc', { type: 'application/msword' });
            const result = validateFileExtension(file);
            expect(result.isValid).toBe(true);
        });

        it('should pass for .docx extension', () => {
            const file = new File(['test'], 'resume.docx', {
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            });
            const result = validateFileExtension(file);
            expect(result.isValid).toBe(true);
        });

        it('should fail for invalid extension', () => {
            const file = new File(['test'], 'resume.txt', { type: 'text/plain' });
            const result = validateFileExtension(file);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('Invalid file type');
        });
    });

    describe('validateMimeType', () => {
        it('should pass for PDF MIME type', () => {
            const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
            const result = validateMimeType(file);
            expect(result.isValid).toBe(true);
        });

        it('should fail for invalid MIME type', () => {
            const file = new File(['test'], 'test.txt', { type: 'text/plain' });
            const result = validateMimeType(file);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('Invalid MIME type');
        });
    });

    describe('validateFileName', () => {
        it('should pass for valid filename', () => {
            const file = new File(['test'], 'john_doe_resume.pdf', { type: 'application/pdf' });
            const result = validateFileName(file);
            expect(result.isValid).toBe(true);
        });

        it('should fail for filename with null bytes', () => {
            const file = new File(['test'], 'resume\0.pdf', { type: 'application/pdf' });
            const result = validateFileName(file);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('Invalid file name');
        });

        it('should fail for excessively long filename', () => {
            const longName = 'a'.repeat(300) + '.pdf';
            const file = new File(['test'], longName, { type: 'application/pdf' });
            const result = validateFileName(file);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('too long');
        });

        it('should fail for suspicious double extension', () => {
            const file = new File(['test'], 'resume.exe.pdf', { type: 'application/pdf' });
            const result = validateFileName(file);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('Suspicious file name');
        });
    });

    describe('formatFileSize', () => {
        it('should format bytes correctly', () => {
            expect(formatFileSize(0)).toBe('0 Bytes');
            expect(formatFileSize(1024)).toBe('1 KB');
            expect(formatFileSize(1024 * 1024)).toBe('1 MB');
            expect(formatFileSize(1536 * 1024)).toBe('1.5 MB');
        });
    });

    describe('FILE_VALIDATION constants', () => {
        it('should have correct max size', () => {
            expect(FILE_VALIDATION.MAX_SIZE).toBe(5 * 1024 * 1024);
        });

        it('should have correct min size', () => {
            expect(FILE_VALIDATION.MIN_SIZE).toBe(1024);
        });

        it('should have correct allowed extensions', () => {
            expect(FILE_VALIDATION.ALLOWED_EXTENSIONS).toEqual(['.pdf', '.doc', '.docx']);
        });
    });
});
