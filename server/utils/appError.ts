/**
 * Custom Error class for operational errors
 * Extends built-in Error to include status, statusCode and isOperational flag
 */
class AppError extends Error {
    public statusCode: number;
    public status: string;
    public isOperational: boolean;

    /**
     * @param {string} message - Error message
     * @param {number} statusCode - HTTP status code
     */
    constructor(message: string, statusCode: number) {
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;
