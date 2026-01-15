

// src/components/ResumeUploadForm.tsx
import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import resumeService from '@/services/resumeService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { Loader2, UploadCloud, AlertCircle, Files } from "lucide-react";
import {
  validateResumeFile,
  FILE_VALIDATION
} from '@/lib/fileValidation';
import { useResumePolling } from '@/hooks/useResumePolling';
import { ProcessingCard, type ProcessingStatusType } from '@/components/Resume';
import { useError } from '@/contexts/ErrorContext';

interface ResumeUploadFormInputs {
  resumeFiles: FileList;
}

interface ResumeUploadFormProps {
  jobId: string;
  onUploadSuccess?: () => void;
}

export default function ResumeUploadForm({ jobId, onUploadSuccess }: ResumeUploadFormProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ResumeUploadFormInputs>();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [selectedFileCount, setSelectedFileCount] = useState<number>(0);
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


  // Validate files when selected
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setValidationError(null);
    setSelectedFileCount(0);

    if (!files || files.length === 0) {
      return;
    }

    setIsValidating(true);

    try {
      if (files.length > 10) {
        setValidationError('Maximum 10 files can be uploaded at once.');
        e.target.value = '';
        return;
      }

      for (let i = 0; i < files.length; i++) {
        const validation = await validateResumeFile(files[i]);
        if (!validation.isValid) {
          setValidationError(`File "${files[i].name}": ${validation.details || validation.error}`);
          e.target.value = '';
          return;
        }
      }

      setSelectedFileCount(files.length);
    } catch (error) {
      console.error('File validation error:', error);
      setValidationError('Unable to validate files. Please try again.');
      e.target.value = '';
    } finally {
      setIsValidating(false);
    }
  };

  const onSubmit: SubmitHandler<ResumeUploadFormInputs> = async (data) => {
    if (!data.resumeFiles || data.resumeFiles.length === 0) {
      toast.error("No files selected", {
        description: "Please select resume files to upload."
      });
      return;
    }

    const filesArray = Array.from(data.resumeFiles);

    setIsLoading(true);
    try {
      const response = await resumeService.uploadResume(jobId, filesArray);
      toast.success("Upload Successful", {
        description: response.message || `${filesArray.length} resumes uploaded and queued.`
      });

      // For simplicity in polling, we start with the first one 
      // In a real app, we'd poll for all of them or use a bulk status endpoint
      if (response.resumeId) {
        setCurrentlyProcessingId(response.resumeId);
        startPolling();
      } else if (response.data && response.data.length > 0) {
        setCurrentlyProcessingId(response.data[0].resumeId);
        startPolling();
      }

      reset();
      setSelectedFileCount(0);
      setValidationError(null);

      // Notify parent to refresh list (they'll appear as processing)
      onUploadSuccess?.();

    } catch (error: any) {
      showError(error, { jobId });
    } finally {
      setIsLoading(false);
    }
  };

  const maxSizeMB = FILE_VALIDATION.MAX_SIZE / (1024 * 1024);

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6 border rounded-xl bg-card shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="resumeFiles" className="text-sm font-semibold text-foreground">
            Select Resume Files
          </Label>
          <p className="text-xs text-muted-foreground">
            Accepted formats: PDF, DOC, DOCX • Max size: {maxSizeMB}MB per file • Max 10 files
          </p>
          <div className="relative">
            <Input
              id="resumeFiles"
              type="file"
              multiple
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              {...register('resumeFiles', {
                required: "At least one resume file is required",
                onChange: handleFileChange
              })}
              disabled={isLoading || isValidating || isPolling}
              className="block w-full text-sm text-muted-foreground
                  file:mr-4 file:py-2 file:px-4 file:rounded-full
                  file:border-0 file:text-sm file:font-semibold
                  file:bg-primary file:text-primary-foreground
                  hover:file:bg-primary/90 cursor-pointer
                  disabled:opacity-50 disabled:cursor-not-allowed h-auto py-2"
            />
          </div>

          <div id="file-upload-status" aria-live="polite" className="mt-2">
            {isValidating && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground animate-in fade-in slide-in-from-top-1">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Validating files integrity...</span>
              </div>
            )}

            {selectedFileCount > 0 && !validationError && !isValidating && (
              <div className="flex items-center gap-3 p-3 bg-secondary/30 border border-secondary rounded-lg animate-in zoom-in-95">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Files className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{selectedFileCount} files selected</p>
                  <p className="text-xs text-muted-foreground">Ready for analysis</p>
                </div>
              </div>
            )}

            {validationError && (
              <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive animate-in shake">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <p className="text-xs font-medium">{validationError}</p>
              </div>
            )}

            {errors.resumeFiles && (
              <p className="text-sm text-destructive font-medium italic">
                {errors.resumeFiles.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading || isValidating || !!validationError || isPolling || selectedFileCount === 0}
            className="w-full sm:w-auto font-semibold shadow-md transition-all active:scale-[0.98]"
          >
            {isLoading
              ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              : <UploadCloud className="mr-2 h-4 w-4" />
            }
            {isLoading ? 'Uploading...' : `Upload & Analyze ${selectedFileCount > 0 ? selectedFileCount : ''} Resumes`}
          </Button>
        </div>
      </form>

      {/* Real-time processing status */}
      {isPolling && currentlyProcessingId && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <ProcessingCard
            filename={processingData?.originalFilename || "Analyzing..."}
            status={processingData?.processingStatus as ProcessingStatusType || 'processing'}
            progress={Math.round(pollingProgress)}
            errorMessage={processingData?.errorDetails}
          />
        </div>
      )}
    </div>
  );
}

