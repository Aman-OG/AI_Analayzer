// src/contexts/ErrorContext.tsx
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';
import { getUserFriendlyMessage, logError } from '@/lib/errors';

interface ErrorContextType {
    showError: (error: unknown, context?: Record<string, any>) => void;
    clearError: () => void;
    lastError: unknown | null;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function ErrorProvider({ children }: { children: ReactNode }) {
    const [lastError, setLastError] = useState<unknown | null>(null);

    const showError = useCallback((error: unknown, context?: Record<string, any>) => {
        setLastError(error);

        // Log the error
        logError(error, context);

        // Show user-friendly toast
        const message = getUserFriendlyMessage(error);
        toast.error('Error', {
            description: message,
            duration: 5000,
        });
    }, []);

    const clearError = useCallback(() => {
        setLastError(null);
    }, []);

    return (
        <ErrorContext.Provider value={{ showError, clearError, lastError }}>
            {children}
        </ErrorContext.Provider>
    );
}

export function useError() {
    const context = useContext(ErrorContext);
    if (context === undefined) {
        throw new Error('useError must be used within an ErrorProvider');
    }
    return context;
}
