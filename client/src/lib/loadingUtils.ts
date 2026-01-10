// src/lib/loadingUtils.ts

/**
 * Utility functions for managing loading states
 */

export interface LoadingState {
    isLoading: boolean;
    error: Error | null;
    data: any | null;
}

export function createLoadingState(): LoadingState {
    return {
        isLoading: false,
        error: null,
        data: null,
    };
}

export function setLoading(state: LoadingState): LoadingState {
    return {
        ...state,
        isLoading: true,
        error: null,
    };
}

export function setSuccess<T>(state: LoadingState, data: T): LoadingState {
    return {
        isLoading: false,
        error: null,
        data,
    };
}

export function setError(state: LoadingState, error: Error): LoadingState {
    return {
        isLoading: false,
        error,
        data: null,
    };
}

/**
 * Simulate loading delay (useful for testing)
 */
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> {
    let lastError: Error;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;
            if (i < maxRetries - 1) {
                const delayMs = baseDelay * Math.pow(2, i);
                await delay(delayMs);
            }
        }
    }

    throw lastError!;
}
