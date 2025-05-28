export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel || (LogLevel = {}));
export class Logger {
    logLevel;
    constructor(level = 'INFO') {
        this.logLevel = LogLevel[level];
    }
    shouldLog(level) {
        return level >= this.logLevel;
    }
    formatMessage(level, message, meta) {
        const timestamp = new Date().toISOString();
        const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] ${level}: ${message}${metaStr}`;
    }
    debug(message, meta) {
        if (this.shouldLog(LogLevel.DEBUG)) {
            console.error(this.formatMessage('DEBUG', message, meta));
        }
    }
    info(message, meta) {
        if (this.shouldLog(LogLevel.INFO)) {
            console.error(this.formatMessage('INFO', message, meta));
        }
    }
    warn(message, meta) {
        if (this.shouldLog(LogLevel.WARN)) {
            console.error(this.formatMessage('WARN', message, meta));
        }
    }
    error(message, meta) {
        if (this.shouldLog(LogLevel.ERROR)) {
            console.error(this.formatMessage('ERROR', message, meta));
        }
    }
}
export const logger = new Logger(process.env.LOG_LEVEL || 'INFO');
//# sourceMappingURL=logger.js.map