export declare class RateLimiter {
    private requests;
    private readonly windowMs;
    private readonly maxRequests;
    constructor(maxRequests: number, windowMs: number);
    checkRateLimit(identifier?: string): Promise<boolean>;
    getRemainingRequests(identifier?: string): number;
    getResetTime(identifier?: string): number;
    cleanup(): void;
}
//# sourceMappingURL=rate-limiter.d.ts.map