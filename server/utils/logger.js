/**
 * Custom Structured Logger
 * Outputs logs in JSON format for production-grade observability
 */

const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
};

const CURRENT_LEVEL = process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;

const log = (level, message, meta = {}) => {
    if (LOG_LEVELS[level] > CURRENT_LEVEL) return;

    const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        ...meta,
        environment: process.env.NODE_ENV || 'development',
    };

    // Ensure message is stringified if it's an object but not Error
    if (typeof message === 'object' && !(message instanceof Error)) {
        logEntry.message = JSON.stringify(message);
        logEntry.data = message;
    }

    if (message instanceof Error) {
        logEntry.message = message.message;
        logEntry.stack = message.stack;
        logEntry.errorName = message.name;
    }

    // Use process.stdout or process.stderr based on level
    const output = level === 'ERROR' ? console.error : console.log;

    if (process.env.NODE_ENV === 'production') {
        output(JSON.stringify(logEntry));
    } else {
        // Pretty print for development
        const color = level === 'ERROR' ? '\x1b[31m' : level === 'WARN' ? '\x1b[33m' : '\x1b[32m';
        const reset = '\x1b[0m';
        console.log(`${color}[${level}]${reset} ${new Date().toLocaleTimeString()} - ${message}`);
        if (Object.keys(meta).length > 0) {
            console.log(JSON.stringify(meta, null, 2));
        }
        if (message instanceof Error && message.stack) {
            console.log(message.stack);
        }
    }
};

const logger = {
    error: (msg, meta) => log('ERROR', msg, meta),
    warn: (msg, meta) => log('WARN', msg, meta),
    info: (msg, meta) => log('INFO', msg, meta),
    debug: (msg, meta) => log('DEBUG', msg, meta),
};

module.exports = logger;
