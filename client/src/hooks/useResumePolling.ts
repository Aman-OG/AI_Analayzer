// src/hooks/useResumePolling.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import resumeService from '@/services/resumeService';

interface PollingOptions {
    interval?: number;
    maxAttempts?: number;
    onComplete?: (data: any) => void;
    onError?: (error: Error) => void;
}

export function useResumePolling(
    resumeId: string | null,
    options: PollingOptions = {}
) {
    const {
        interval = 3000, // Poll every 3 seconds
        maxAttempts = 60, // Max 3 minutes (60 * 3s)
        onComplete,
        onError,
    } = options;

    const [data, setData] = useState<any>(null);
    const [isPolling, setIsPolling] = useState(false);
    const [progress, setProgress] = useState(0);
    const attemptCount = useRef(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const stopPolling = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsPolling(false);
    }, []);

    const checkStatus = useCallback(async () => {
        if (!resumeId) return;

        try {
            attemptCount.current += 1;

            // Calculate progress (0-90% during polling, 100% when complete)
            const calculatedProgress = Math.min(
                90,
                (attemptCount.current / maxAttempts) * 90
            );
            setProgress(calculatedProgress);

            const response = await resumeService.getResumeStatus(resumeId);
            setData(response);

            // Check if processing is complete
            if (response.processingStatus === 'completed') {
                setProgress(100);
                stopPolling();
                onComplete?.(response);
            } else if (response.processingStatus === 'error') {
                stopPolling();
                onError?.(new Error(response.errorDetails || 'Processing failed'));
            } else if (attemptCount.current >= maxAttempts) {
                stopPolling();
                onError?.(new Error('Polling timeout: Processing took too long'));
            }
        } catch (error) {
            stopPolling();
            onError?.(error as Error);
        }
    }, [resumeId, maxAttempts, stopPolling, onComplete, onError]);

    const startPolling = useCallback(() => {
        if (!resumeId || isPolling) return;

        attemptCount.current = 0;
        setProgress(0);
        setIsPolling(true);

        // Initial check
        checkStatus();

        // Set up interval
        intervalRef.current = setInterval(checkStatus, interval);
    }, [resumeId, isPolling, interval, checkStatus]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopPolling();
        };
    }, [stopPolling]);

    return {
        data,
        isPolling,
        progress,
        startPolling,
        stopPolling,
    };
}
