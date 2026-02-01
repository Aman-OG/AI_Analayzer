import { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

type StatusType = 'uploaded' | 'parsing' | 'processing' | 'scoring' | 'finalizing' | 'completed' | 'error';

interface AnalysisStepperProps {
    status: StatusType;
}

const steps = [
    { id: 'parsing', label: 'Extracting Text', statuses: ['parsing'] },
    { id: 'scoring', label: 'AI Scoring', statuses: ['processing', 'scoring'] },
    { id: 'finalizing', label: 'Finalizing Report', statuses: ['finalizing'] },
    { id: 'completed', label: 'Completed', statuses: ['completed'] },
];

export function AnalysisStepper({ status }: AnalysisStepperProps) {
    const [currentStepIndex, setCurrentStepIndex] = useState(-1);

    useEffect(() => {
        const index = steps.findIndex(step => step.statuses.includes(status));
        if (status === 'completed') {
            setCurrentStepIndex(steps.length - 1);
        } else if (index !== -1) {
            setCurrentStepIndex(index);
        } else if (status === 'error') {
            // Keep index as is or handle error state visually
        }
    }, [status]);

    return (
        <div className="w-full max-w-md mx-auto py-6">
            <div className="relative flex justify-between">
                {steps.map((step, index) => {
                    const isCompleted = index < currentStepIndex || status === 'completed';
                    const isActive = index === currentStepIndex && status !== 'completed';
                    const isError = status === 'error' && index === currentStepIndex;

                    return (
                        <div key={step.id} className="flex flex-col items-center relative z-10 w-1/4">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isCompleted
                                    ? 'bg-primary border-primary text-white'
                                    : isActive
                                        ? 'border-primary bg-background text-primary animate-glow'
                                        : isError
                                            ? 'border-destructive bg-destructive/10 text-destructive'
                                            : 'border-muted bg-muted/20 text-muted-foreground'
                                    }`}
                            >
                                {isCompleted ? (
                                    <CheckCircle2 className="w-6 h-6" />
                                ) : isActive ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <Circle className="w-4 h-4" />
                                )}
                            </div>
                            <div className="mt-2 text-[10px] font-medium text-center uppercase tracking-wider text-muted-foreground">
                                {step.label}
                            </div>

                            {/* Connector line */}
                            {index < steps.length - 1 && (
                                <div
                                    className={`absolute top-5 left-1/2 w-full h-[2px] -z-10 transition-colors duration-500 ${index < currentStepIndex ? 'bg-primary' : 'bg-muted/30'
                                        }`}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
