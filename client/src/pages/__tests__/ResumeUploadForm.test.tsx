// src/pages/__tests__/ResumeUploadForm.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResumeUploadForm from '../ResumeUploadForm';
import * as fileValidation from '@/lib/fileValidation';
import { ErrorProvider } from '@/contexts/ErrorContext';

// Mock the resume service
vi.mock('@/services/resumeService', () => ({
    default: {
        uploadResume: vi.fn(),
    },
}));

// Mock sonner toast
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('ResumeUploadForm', () => {
    const mockJobId = 'test-job-123';
    const mockOnUploadSuccess = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render upload form', () => {
        render(
            <ErrorProvider>
                <ResumeUploadForm jobId={mockJobId} />
            </ErrorProvider>
        );

        expect(screen.getByLabelText(/Select Resume File/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Upload & Analyze/i })).toBeInTheDocument();
    });

    it('should display file size limit information', () => {
        render(
            <ErrorProvider>
                <ResumeUploadForm jobId={mockJobId} />
            </ErrorProvider>
        );

        expect(screen.getByText(/Max size: 5MB/i)).toBeInTheDocument();
        expect(screen.getByText(/Accepted formats: PDF, DOC, DOCX/i)).toBeInTheDocument();
    });

    it('should disable upload button when no file is selected', () => {
        render(
            <ErrorProvider>
                <ResumeUploadForm jobId={mockJobId} />
            </ErrorProvider>
        );

        const uploadButton = screen.getByRole('button', { name: /Upload & Analyze/i });
        expect(uploadButton).toBeDisabled();
    });

    it('should show validation error for invalid file', async () => {
        const user = userEvent.setup();

        // Mock validation to return error
        vi.spyOn(fileValidation, 'validateResumeFile').mockResolvedValue({
            isValid: false,
            error: 'Invalid file name',
            details: 'File name contains invalid characters.',
        });

        render(
            <ErrorProvider>
                <ResumeUploadForm jobId={mockJobId} />
            </ErrorProvider>
        );

        const file = new File(['test'], 'test.txt', { type: 'text/plain' });
        const input = screen.getByLabelText(/Select Resume File/i);

        await user.upload(input, file);

        await waitFor(() => {
            expect(screen.getByText(/File "test.txt": File name contains invalid characters/i)).toBeInTheDocument();
        }, { timeout: 2000 });
    });

    it('should show file info on successful validation', async () => {
        const user = userEvent.setup();

        // Mock validation to return success
        vi.spyOn(fileValidation, 'validateResumeFile').mockResolvedValue({
            isValid: true,
        });

        render(
            <ErrorProvider>
                <ResumeUploadForm jobId={mockJobId} />
            </ErrorProvider>
        );

        const file = new File(['test'], 'resume.pdf', { type: 'application/pdf' });
        Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB

        const input = screen.getByLabelText(/Select Resume File/i);
        await user.upload(input, file);

        await waitFor(() => {
            expect(screen.getByText(/1 files selected/i)).toBeInTheDocument();
        });
    });

    it('should show loading state during validation', async () => {
        const user = userEvent.setup();

        // Mock validation with delay
        vi.spyOn(fileValidation, 'validateResumeFile').mockImplementation(() =>
            new Promise(resolve => setTimeout(() => resolve({ isValid: true }), 100))
        );

        render(
            <ErrorProvider>
                <ResumeUploadForm jobId={mockJobId} />
            </ErrorProvider>
        );

        const file = new File(['test'], 'resume.pdf', { type: 'application/pdf' });
        const input = screen.getByLabelText(/Select Resume File/i);

        await user.upload(input, file);

        expect(screen.getByText(/Validating files integrity/i)).toBeInTheDocument();
    });

    it('should call onUploadSuccess callback after successful upload', async () => {
        const user = userEvent.setup();
        const resumeService = await import('@/services/resumeService');

        vi.spyOn(fileValidation, 'validateResumeFile').mockResolvedValue({
            isValid: true,
        });

        (resumeService.default.uploadResume as any).mockResolvedValue({
            message: 'Upload successful',
            resumeId: 'resume-123',
        });

        render(
            <ErrorProvider>
                <ResumeUploadForm jobId={mockJobId} onUploadSuccess={mockOnUploadSuccess} />
            </ErrorProvider>
        );

        const file = new File(['test'], 'resume.pdf', { type: 'application/pdf' });
        const input = screen.getByLabelText(/Select Resume File/i);

        await user.upload(input, file);

        await waitFor(() => {
            expect(screen.getByText(/1 files selected/i)).toBeInTheDocument();
        });

        const uploadButton = screen.getByRole('button', { name: /Upload & Analyze 1 Resumes/i });
        await user.click(uploadButton);

        await waitFor(() => {
            expect(mockOnUploadSuccess).toHaveBeenCalled();
        });
    });
});
