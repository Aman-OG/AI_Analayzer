

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
      reset();
      setFileInfo(null);
      setValidationError(null);
      onUploadSuccess?.();
    } catch (error: any) {
      console.error("Resume upload failed:", error);
      toast.error("Upload Failed", {
        description: error.message || "Could not upload resume."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const maxSizeMB = FILE_VALIDATION.MAX_SIZE / (1024 * 1024);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="resumeFile" className="mb-2 block text-sm font-medium">
          Select Resume File
        </Label>
        <p className="text-xs text-muted-foreground mb-2">
          Accepted formats: PDF, DOC, DOCX • Max size: {maxSizeMB}MB
        </p>
        <Input
          id="resumeFile"
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          {...register('resumeFile', {
            required: "Resume file is required",
            onChange: handleFileChange
          })}
          disabled={isLoading || isValidating}
          className="block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4 file:rounded-full
            file:border-0 file:text-sm file:font-semibold
            file:bg-primary file:text-primary-foreground
            hover:file:bg-primary/90 cursor-pointer
            disabled:opacity-50 disabled:cursor-not-allowed"
        />

        {/* Validation in progress */}
        {isValidating && (
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Validating file...</span>
          </div>
        )}

        {/* File info on successful validation */}
        {fileInfo && !validationError && !isValidating && (
          <div className="flex items-center gap-2 mt-2 p-2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
            <FileCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
            <div className="text-xs">
              <p className="font-medium text-green-900 dark:text-green-100">{fileInfo.name}</p>
              <p className="text-green-700 dark:text-green-300">{fileInfo.size}</p>
            </div>
          </div>
        )}

        {/* Validation error */}
        {validationError && (
          <div className="flex items-start gap-2 mt-2 p-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
            <p className="text-xs text-red-900 dark:text-red-100">{validationError}</p>
          </div>
        )}

        {/* Form validation error */}
        {errors.resumeFile && (
          <p className="text-sm text-destructive mt-1">
            {errors.resumeFile.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading || isValidating || !!validationError}
        className="w-full sm:w-auto"
      >
        {isLoading
          ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          : <UploadCloud className="mr-2 h-4 w-4" />
        }
        {isLoading ? 'Uploading...' : 'Upload & Analyze'}
      </Button>
    </form>
  );
}
