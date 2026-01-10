// src/components/ErrorBoundary/ErrorFallback.tsx
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorFallbackProps {
    error?: Error;
    resetError?: () => void;
    title?: string;
    description?: string;
}

export default function ErrorFallback({
    error,
    resetError,
    title = 'Something went wrong',
    description = 'An unexpected error occurred. Please try again.',
}: ErrorFallbackProps) {
    const handleGoHome = () => {
        window.location.href = '/';
    };

    return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
            <div className="max-w-md w-full space-y-6 text-center">
                <div className="flex justify-center">
                    <div className="rounded-full bg-destructive/10 p-6">
                        <AlertTriangle className="h-12 w-12 text-destructive" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">{title}</h2>
                    <p className="text-muted-foreground">{description}</p>
                </div>

                {process.env.NODE_ENV === 'development' && error && (
                    <div className="bg-muted p-4 rounded-lg text-left">
                        <p className="text-sm font-mono text-destructive break-all">
                            {error.toString()}
                        </p>
                    </div>
                )}

                <div className="flex gap-3 justify-center">
                    {resetError && (
                        <Button onClick={resetError} variant="outline">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Try Again
                        </Button>
                    )}
                    <Button onClick={handleGoHome}>
                        <Home className="mr-2 h-4 w-4" />
                        Go Home
                    </Button>
                </div>
            </div>
        </div>
    );
}
