// src/components/ErrorBoundary/RouteErrorBoundary.tsx
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RouteErrorBoundary() {
    const error = useRouteError();
    const navigate = useNavigate();

    let errorMessage: string;
    let errorStatus: number | undefined;

    if (isRouteErrorResponse(error)) {
        errorStatus = error.status;
        errorMessage = error.statusText || error.data?.message || 'An error occurred';
    } else if (error instanceof Error) {
        errorMessage = error.message;
    } else {
        errorMessage = 'An unexpected error occurred';
    }

    const is404 = errorStatus === 404;

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="max-w-md w-full space-y-6 text-center">
                <div className="flex justify-center">
                    <div className="rounded-full bg-destructive/10 p-6">
                        <AlertTriangle className="h-12 w-12 text-destructive" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-4xl font-bold text-foreground">
                        {errorStatus || 'Error'}
                    </h1>
                    <h2 className="text-2xl font-semibold text-foreground">
                        {is404 ? 'Page Not Found' : 'Something Went Wrong'}
                    </h2>
                    <p className="text-muted-foreground">
                        {is404
                            ? "The page you're looking for doesn't exist or has been moved."
                            : errorMessage
                        }
                    </p>
                </div>

                {process.env.NODE_ENV === 'development' && error instanceof Error && (
                    <div className="bg-muted p-4 rounded-lg text-left">
                        <p className="text-sm font-mono text-destructive">
                            {error.stack}
                        </p>
                    </div>
                )}

                <div className="flex gap-3 justify-center">
                    <Button onClick={() => navigate(-1)} variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Go Back
                    </Button>
                    <Button onClick={() => navigate('/')}>
                        <Home className="mr-2 h-4 w-4" />
                        Go Home
                    </Button>
                </div>
            </div>
        </div>
    );
}
