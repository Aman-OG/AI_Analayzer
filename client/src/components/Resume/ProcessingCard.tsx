// src/components/Resume/ProcessingCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProcessingStatus, { ProcessingStatusType } from "./ProcessingStatus";
import StatusTimeline from "./StatusTimeline";
import { FileText } from "lucide-react";

interface ProcessingCardProps {
    filename: string;
    status: ProcessingStatusType;
    progress?: number;
    uploadedAt?: string;
    processedAt?: string;
    errorMessage?: string;
}

export default function ProcessingCard({
    filename,
    status,
    progress = 0,
    uploadedAt,
    processedAt,
    errorMessage,
}: ProcessingCardProps) {
    const timelineSteps = [
        {
            label: 'Resume uploaded',
            status: 'completed' as const,
            timestamp: uploadedAt,
        },
        {
            label: 'Extracting text',
            status: status === 'uploaded' ? 'current' as const :
                status === 'error' ? 'error' as const : 'completed' as const,
        },
        {
            label: 'AI analysis in progress',
            status: status === 'processing' ? 'current' as const :
                status === 'completed' ? 'completed' as const :
                    status === 'error' ? 'error' as const : 'pending' as const,
        },
        {
            label: 'Analysis complete',
            status: status === 'completed' ? 'completed' as const : 'pending' as const,
            timestamp: processedAt,
        },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5" />
                    {filename}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <ProcessingStatus
                    status={status}
                    progress={progress}
                    errorMessage={errorMessage}
                />

                <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-4">Processing Steps</h4>
                    <StatusTimeline steps={timelineSteps} />
                </div>
            </CardContent>
        </Card>
    );
}
