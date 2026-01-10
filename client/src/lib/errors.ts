// src/lib/errors.ts

/**
 * Custom error types for better error handling
 */

export class AppError extends Error {
    constructor(
        message: string,
        public code?: string,
        public statusCode?: number
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export class NetworkError extends AppError {
    constructor(message: string = 'Network error occurred') {
        super(message, 'NETWORK_ERROR', 0);
        this.name = 'NetworkError';
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = 'Authentication failed') {
        super(message, 'AUTH_ERROR', 401);
        this.name = 'AuthenticationError';
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = 'You do not have permission to perform this action') {
        super(message, 'AUTHORIZATION_ERROR', 403);
        this.name = 'AuthorizationError';
    }
}

export class ValidationError extends AppError {
    constructor(
        message: string = 'Validation failed',
        public errors?: Record<string, string[]>
    ) {
        super(message, 'VALIDATION_ERROR', 400);
        this.name = 'ValidationError';
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = 'Resource not found') {
        super(message, 'NOT_FOUND', 404);
        this.name = 'NotFoundError';
    }
}

export class ServerError extends AppError {
    constructor(message: string = 'Server error occurred') {
        super(message, 'SERVER_ERROR', 500);
        this.name = 'ServerError';
    }
}

/**
 * Error utility functions
 */

export function getErrorMessage(error: unknown): string {
    if (error instanceof AppError) {
        return error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === 'string') {
        return error;
    }

    return 'An unexpected error occurred';
}

export function isNetworkError(error: unknown): boolean {
    return error instanceof NetworkError ||
        (error instanceof Error && error.message.includes('network'));
}

export function isAuthError(error: unknown): boolean {
    return error instanceof AuthenticationError ||
        error instanceof AuthorizationError;
}

export function getUserFriendlyMessage(error: unknown): string {
    if (error instanceof NetworkError) {
        return 'Unable to connect to the server. Please check your internet connection and try again.';
    }

    if (error instanceof AuthenticationError) {
        return 'Your session has expired. Please log in again.';
    }

    if (error instanceof AuthorizationError) {
        return 'You do not have permission to perform this action.';
    }

    if (error instanceof ValidationError) {
        return error.message || 'Please check your input and try again.';
    }

    if (error instanceof NotFoundError) {
        return 'The requested resource was not found.';
    }

    if (error instanceof ServerError) {
        return 'A server error occurred. Our team has been notified.';
    }

    return getErrorMessage(error);
}

export function logError(error: unknown, context?: Record<string, any>) {
    console.error('Error occurred:', {
        error,
        message: getErrorMessage(error),
        context,
        timestamp: new Date().toISOString(),
    });

    // TODO: Send to error reporting service (e.g., Sentry)
    // if (process.env.NODE_ENV === 'production') {
    //   Sentry.captureException(error, { extra: context });
    // }
}
