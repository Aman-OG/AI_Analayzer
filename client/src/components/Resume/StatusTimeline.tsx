// src/components/Resume/StatusTimeline.tsx
import { CheckCircle2, Circle, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineStep {
    label: string;
    status: 'completed' | 'current' | 'pending' | 'error';
    timestamp?: string;
}

interface StatusTimelineProps {
    steps: TimelineStep[];
}

export default function StatusTimeline({ steps }: StatusTimelineProps) {
    return (
        <div className="space-y-4">
            {steps.map((step, index) => {
                const isLast = index === steps.length - 1;

                return (
                    <div key={index} className="flex gap-4">
                        {/* Icon and Line */}
                        <div className="flex flex-col items-center">
                            <div className={cn(
                                "rounded-full p-1",
                                step.status === 'completed' && "bg-green-100 text-green-600",
                                step.status === 'current' && "bg-blue-100 text-blue-600",
                                step.status === 'error' && "bg-red-100 text-red-600",
                                step.status === 'pending' && "bg-gray-100 text-gray-400"
                            )}>
                                {step.status === 'completed' && <CheckCircle2 className="h-5 w-5" />}
                                {step.status === 'current' && <Loader2 className="h-5 w-5 animate-spin" />}
                                {step.status === 'error' && <XCircle className="h-5 w-5" />}
                                {step.status === 'pending' && <Circle className="h-5 w-5" />}
                            </div>
                            {!isLast && (
                                <div className={cn(
                                    "w-0.5 h-12 mt-1",
                                    step.status === 'completed' ? "bg-green-200" : "bg-gray-200"
                                )} />
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-8">
                            <p className={cn(
                                "font-medium",
                                step.status === 'pending' && "text-muted-foreground"
                            )}>
                                {step.label}
                            </p>
                            {step.timestamp && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    {step.timestamp}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
