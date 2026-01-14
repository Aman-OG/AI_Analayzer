/**
 * Custom Structured Logger
 * Outputs logs in JSON format for production-grade observability
 */

interface LogEntry {
    timestamp: string;
    level: string;
    message: string;
    environment: string;
    [key: string]: any;
}

const LOG_LEVELS: Record<string, number> = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
};

const CURRENT_LEVEL = process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;

const log = (level: string, message: any, meta: Record<string, any> = {}) => {
    if (LOG_LEVELS[level] > CURRENT_LEVEL) return;

    const logEntry: LogEntry = {
        timestamp: new Date().toISOString(),
        level,
        message: typeof message === 'string' ? message : message.message || JSON.stringify(message),
        ...meta,
        environment: process.env.NODE_ENV || 'development',
    };

    if (message instanceof Error) {
        logEntry.message = message.message;
        logEntry.stack = message.stack;
        logEntry.errorName = message.name;
    }

    const output = level === 'ERROR' ? console.error : console.log;

    if (process.env.NODE_ENV === 'production') {
        output(JSON.stringify(logEntry));
    } else {
        const color = level === 'ERROR' ? '\x1b[31m' : level === 'WARN' ? '\x1b[33m' : '\x1b[32m';
        const reset = '\x1b[0m';
        console.log(`${color}[${level}]${reset} ${new Date().toLocaleTimeString()} - ${logEntry.message}`);
        if (Object.keys(meta).length > 0) {
            console.log(JSON.stringify(meta, null, 2));
        }
    }
};

const logger = {
    error: (msg: any, meta?: any) => log('ERROR', msg, meta),
    warn: (msg: any, meta?: any) => log('WARN', msg, meta),
    info: (msg: any, meta?: any) => log('INFO', msg, meta),
    debug: (msg: any, meta?: any) => log('DEBUG', msg, meta),
};

export default logger;
