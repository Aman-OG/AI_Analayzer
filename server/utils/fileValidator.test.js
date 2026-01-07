// server/utils/fileValidator.test.js
const {
    validateFileSize,
    validateFileExtension,
    validateMimeType,
    validateFileSignature,
    validateFileName,
    validateResumeFile,
    checkForMaliciousContent,
    FILE_VALIDATION,
} = require('./fileValidator');

describe('File Validator', () => {
    describe('validateFileSize', () => {
        it('should pass for valid file size', () => {
            const result = validateFileSize(1024 * 1024); // 1MB
            expect(result.isValid).toBe(true);
        });

        it('should fail for file too large', () => {
            const result = validateFileSize(10 * 1024 * 1024); // 10MB
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('exceeds maximum');
        });

        it('should fail for file too small', () => {
            const result = validateFileSize(500); // 500 bytes
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('too small');
        });
    });

    describe('validateFileExtension', () => {
        it('should pass for .pdf extension', () => {
            const result = validateFileExtension('resume.pdf');
            expect(result.isValid).toBe(true);
        });

        it('should pass for .doc extension', () => {
            const result = validateFileExtension('resume.doc');
            expect(result.isValid).toBe(true);
        });

        it('should pass for .docx extension', () => {
            const result = validateFileExtension('resume.docx');
            expect(result.isValid).toBe(true);
        });

        it('should fail for invalid extension', () => {
            const result = validateFileExtension('resume.txt');
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('Invalid file extension');
        });

        it('should be case insensitive', () => {
            const result = validateFileExtension('resume.PDF');
            expect(result.isValid).toBe(true);
        });
    });

    describe('validateMimeType', () => {
        it('should pass for PDF MIME type', () => {
            const result = validateMimeType('application/pdf');
            expect(result.isValid).toBe(true);
        });

        it('should pass for DOC MIME type', () => {
            const result = validateMimeType('application/msword');
            expect(result.isValid).toBe(true);
        });

        it('should pass for DOCX MIME type', () => {
            const result = validateMimeType('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            expect(result.isValid).toBe(true);
        });

        it('should fail for invalid MIME type', () => {
            const result = validateMimeType('text/plain');
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('Invalid file type');
        });
    });

    describe('validateFileSignature', () => {
        it('should pass for valid PDF signature', () => {
            const pdfBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]); // %PDF-1.4
            const result = validateFileSignature(pdfBuffer, 'test.pdf');
            expect(result.isValid).toBe(true);
        });

        it('should pass for valid DOC signature', () => {
            const docBuffer = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
            const result = validateFileSignature(docBuffer, 'test.doc');
            expect(result.isValid).toBe(true);
        });

        it('should pass for valid DOCX signature', () => {
            const docxBuffer = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x06, 0x00]);
            const result = validateFileSignature(docxBuffer, 'test.docx');
            expect(result.isValid).toBe(true);
        });

        it('should fail for mismatched signature', () => {
            const txtBuffer = Buffer.from('This is plain text');
            const result = validateFileSignature(txtBuffer, 'fake.pdf');
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('does not match PDF format');
        });

        it('should fail for corrupted file', () => {
            const corruptedBuffer = Buffer.from([0x00, 0x00]);
            const result = validateFileSignature(corruptedBuffer, 'test.pdf');
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('corrupted');
        });
    });

    describe('validateFileName', () => {
        it('should pass for valid filename', () => {
            const result = validateFileName('john_doe_resume.pdf');
            expect(result.isValid).toBe(true);
        });

        it('should fail for filename with null bytes', () => {
            const result = validateFileName('resume\0.pdf');
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('invalid characters');
        });

        it('should fail for filename with path traversal', () => {
            const result = validateFileName('../../../etc/passwd');
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('invalid path characters');
        });

        it('should fail for excessively long filename', () => {
            const longName = 'a'.repeat(300) + '.pdf';
            const result = validateFileName(longName);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('too long');
        });

        it('should fail for suspicious double extension', () => {
            const result = validateFileName('resume.exe.pdf');
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('dangerous extensions');
        });

        it('should pass for filename with multiple dots', () => {
            const result = validateFileName('john.doe.resume.pdf');
            expect(result.isValid).toBe(true);
        });
    });

    describe('checkForMaliciousContent', () => {
        it('should pass for clean PDF content', () => {
            const cleanBuffer = Buffer.from('%PDF-1.4\nClean content');
            const result = checkForMaliciousContent(cleanBuffer);
            expect(result.isValid).toBe(true);
        });

        it('should fail for content with script tags', () => {
            const maliciousBuffer = Buffer.from('<script>alert("xss")</script>');
            const result = checkForMaliciousContent(maliciousBuffer);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('malicious content');
        });

        it('should fail for content with javascript:', () => {
            const maliciousBuffer = Buffer.from('javascript:void(0)');
            const result = checkForMaliciousContent(maliciousBuffer);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('malicious content');
        });

        it('should fail for Windows executable signature', () => {
            const exeBuffer = Buffer.from([0x4d, 0x5a, 0x90, 0x00]); // MZ header
            const result = checkForMaliciousContent(exeBuffer);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('executable');
        });

        it('should fail for Linux executable signature', () => {
            const elfBuffer = Buffer.from([0x7f, 0x45, 0x4c, 0x46]); // ELF header
            const result = checkForMaliciousContent(elfBuffer);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('executable');
        });
    });

    describe('validateResumeFile (integration)', () => {
        it('should pass for valid PDF file', () => {
            const validFile = {
                originalname: 'resume.pdf',
                size: 2 * 1024 * 1024, // 2MB
                mimetype: 'application/pdf',
                buffer: Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]),
            };

            const result = validateResumeFile(validFile);
            expect(result.isValid).toBe(true);
        });

        it('should fail if any validation fails', () => {
            const invalidFile = {
                originalname: 'resume.txt',
                size: 2 * 1024 * 1024,
                mimetype: 'text/plain',
                buffer: Buffer.from('Plain text'),
            };

            const result = validateResumeFile(invalidFile);
            expect(result.isValid).toBe(false);
        });

        it('should fail for file with suspicious name', () => {
            const suspiciousFile = {
                originalname: 'resume.exe.pdf',
                size: 2 * 1024 * 1024,
                mimetype: 'application/pdf',
                buffer: Buffer.from([0x25, 0x50, 0x44, 0x46]),
            };

            const result = validateResumeFile(suspiciousFile);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('dangerous extensions');
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

        it('should have correct allowed MIME types', () => {
            expect(FILE_VALIDATION.ALLOWED_MIME_TYPES).toContain('application/pdf');
            expect(FILE_VALIDATION.ALLOWED_MIME_TYPES).toContain('application/msword');
        });
    });
});
