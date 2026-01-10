// src/components/Resume/ProcessingStatus.tsx
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/Loading";
import {
    CheckCircle2,
    XCircle,
    Clock,
    Upload,
    FileText,
    Sparkles
} from "lucide-react";

export type ProcessingStatusType = 'uploaded' | 'processing' | 'completed' | 'error';

interface ProcessingStatusProps {
    status: ProcessingStatusType;
    progress?: number;
    errorMessage?: string;
    showProgress?: boolean;
}

const statusConfig = {
    uploaded: {
        label: 'Uploaded',
        icon: Upload,
        variant: 'info' as const,
        description: 'Resume uploaded successfully',
    },
    processing: {
        label: 'Processing',
        icon: Sparkles,
        variant: 'warning' as const,
        description: 'Analyzing resume with AI',
    },
    completed: {
        label: 'Completed',
        icon: CheckCircle2,
        variant: 'success' as const,
        description: 'Analysis complete',
    },
    error: {
        label: 'Error',
        icon: XCircle,
        variant: 'destructive' as const,
        description: 'Processing failed',
    },
};

export default function ProcessingStatus({
    status,
    progress = 0,
    errorMessage,
    showProgress = true
}: ProcessingStatusProps) {
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                {status === 'processing' ? (
                    <LoadingSpinner size="sm" />
                ) : (
                    <Icon className="h-4 w-4" />
                )}
                <Badge variant={config.variant}>
                    {config.label}
                </Badge>
                <span className="text-sm text-muted-foreground">
                    {errorMessage || config.description}
                </span>
            </div>

            {showProgress && status === 'processing' && (
                <div className="space-y-1">
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground text-right">
                        {progress}% complete
                    </p>
                </div>
            )}
        </div>
    );
}
