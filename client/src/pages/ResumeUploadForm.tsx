

// src/components/ResumeUploadForm.tsx
import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import resumeService from '@/services/resumeService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { Loader2, UploadCloud, FileCheck, AlertCircle } from "lucide-react";
import {
  validateResumeFile,
  formatFileSize,
  FILE_VALIDATION
} from '@/lib/fileValidation';
import { useResumePolling } from '@/hooks/useResumePolling';
import { ProcessingCard, type ProcessingStatusType } from '@/components/Resume';
import { useError } from '@/contexts/ErrorContext';

interface ResumeUploadFormInputs {
  resumeFile: FileList;
}

interface ResumeUploadFormProps {
  jobId: string;
  onUploadSuccess?: () => void;
}

export default function ResumeUploadForm({ jobId, onUploadSuccess }: ResumeUploadFormProps) {
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<ResumeUploadFormInputs>();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: string } | null>(null);
  const [currentlyProcessingId, setCurrentlyProcessingId] = useState<string | null>(null);
  const { showError } = useError();

  const {
    data: processingData,
    isPolling,
    progress: pollingProgress,
    startPolling
  } = useResumePolling(currentlyProcessingId, {
    onComplete: (data) => {
      toast.success("Analysis Complete", {
        description: `Resume "${data.originalFilename}" analyzed successfully with score: ${data.score}/10`
      });
      onUploadSuccess?.();
    },
    onError: (error) => {
      showError(error, { resumeId: currentlyProcessingId, jobId });
    }
  });

  const resumeFileValue = watch("resumeFile");


  // Validate file when selected
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setValidationError(null);
    setFileInfo(null);

    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    setIsValidating(true);

    try {
      const validation = await validateResumeFile(file);

      if (!validation.isValid) {
        setValidationError(validation.details || validation.error || 'Invalid file');
        // Clear the file input
        e.target.value = '';
      } else {
        setFileInfo({
          name: file.name,
          size: formatFileSize(file.size),
        });
      }
    } catch (error) {
      console.error('File validation error:', error);
      setValidationError('Unable to validate file. Please try again.');
      e.target.value = '';
    } finally {
      setIsValidating(false);
    }
  };

  const onSubmit: SubmitHandler<ResumeUploadFormInputs> = async (data) => {
    if (!data.resumeFile || data.resumeFile.length === 0) {
      toast.error("No file selected", {
        description: "Please select a resume file to upload."
      });
      return;
    }

    const file = data.resumeFile[0];

    // Re-validate before upload (in case validation was bypassed)
    setIsValidating(true);
    const validation = await validateResumeFile(file);
    setIsValidating(false);

    if (!validation.isValid) {
      toast.error(validation.error || "Invalid file", {
        description: validation.details || "Please select a valid resume file."
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await resumeService.uploadResume(jobId, file);
      toast.success("Upload Successful", {
        description: response.message || "Resume uploaded and queued for analysis."
      });

      // Reset form and start polling
      setCurrentlyProcessingId(response.resumeId);
      startPolling();

      reset();
      setFileInfo(null);
      setValidationError(null);
    } catch (error: any) {
      showError(error, { jobId, fileName: file.name });
    } finally {
      setIsLoading(false);
    }

  };

  const maxSizeMB = FILE_VALIDATION.MAX_SIZE / (1024 * 1024);

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6 border rounded-xl bg-card shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="resumeFile" className="text-sm font-semibold text-foreground">
            Select Resume File
          </Label>
          <p className="text-xs text-muted-foreground">
            Accepted formats: PDF, DOC, DOCX • Max size: {maxSizeMB}MB
          </p>
          <div className="relative">
            <Input
              id="resumeFile"
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              {...register('resumeFile', {
                required: "Resume file is required",
                onChange: handleFileChange
              })}
              disabled={isLoading || isValidating || isPolling}
              aria-invalid={!!errors.resumeFile || !!validationError}
              aria-describedby="file-upload-desc"
              className="block w-full text-sm text-muted-foreground
                  file:mr-4 file:py-2 file:px-4 file:rounded-full
                  file:border-0 file:text-sm file:font-semibold
                  file:bg-primary file:text-primary-foreground
                  hover:file:bg-primary/90 cursor-pointer
                  disabled:opacity-50 disabled:cursor-not-allowed h-auto py-2"
            />
          </div>

          <div id="file-upload-status" aria-live="polite" className="mt-2">
            {/* Validation in progress */}
            {isValidating && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground animate-in fade-in slide-in-from-top-1">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Validating file integrity...</span>
              </div>
            )}

            {/* File info on successful validation */}
            {fileInfo && !validationError && !isValidating && (
              <div className="flex items-center gap-3 p-3 bg-secondary/30 border border-secondary rounded-lg animate-in zoom-in-95">
                <div className="bg-primary/10 p-2 rounded-full">
                  <FileCheck className="h-4 w-4 text-primary" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate">Selected: {fileInfo.name}</p>
                  <p className="text-xs text-muted-foreground">{fileInfo.size}</p>
                </div>
              </div>
            )}

            {/* Validation error */}
            {validationError && (
              <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive animate-in shake">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <p className="text-xs font-medium">{validationError}</p>
              </div>
            )}

            {/* Form validation error */}
            {errors.resumeFile && (
              <p className="text-sm text-destructive font-medium italic">
                {errors.resumeFile.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading || isValidating || !!validationError || isPolling}
            className="w-full sm:w-auto font-semibold shadow-md transition-all active:scale-[0.98]"
          >
            {isLoading
              ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              : <UploadCloud className="mr-2 h-4 w-4" />
            }
            {isLoading ? 'Uploading...' : 'Upload & Analyze'}
          </Button>
      </form>

      {/* Real-time processing status */}
      {isPolling && currentlyProcessingId && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <ProcessingCard
            filename={processingData?.originalFilename || "Loading..."}
            status={processingData?.processingStatus as ProcessingStatusType || 'processing'}
            progress={Math.round(pollingProgress)}
            errorMessage={processingData?.errorDetails}
          />
        </div>
      )}
    </div>
  );
}

