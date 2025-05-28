export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}
export declare class Logger {
    private logLevel;
    constructor(level?: keyof typeof LogLevel);
    private shouldLog;
    private formatMessage;
    debug(message: string, meta?: any): void;
    info(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    error(message: string, meta?: any): void;
}
export declare const logger: Logger;
//# sourceMappingURL=logger.d.ts.map