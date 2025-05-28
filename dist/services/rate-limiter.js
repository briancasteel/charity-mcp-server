import { logger } from '../utils/logger.js';
export class RateLimiter {
    requests = new Map();
    windowMs;
    maxRequests;
    constructor(maxRequests, windowMs) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
    }
    async checkRateLimit(identifier = 'global') {
        const now = Date.now();
        const requests = this.requests.get(identifier) || [];
        // Remove requests outside the current window
        const validRequests = requests.filter(time => now - time < this.windowMs);
        if (validRequests.length >= this.maxRequests) {
            logger.warn('Rate limit exceeded', { identifier, requests: validRequests.length });
            return false;
        }
        // Add current request
        validRequests.push(now);
        this.requests.set(identifier, validRequests);
        return true;
    }
    getRemainingRequests(identifier = 'global') {
        const now = Date.now();
        const requests = this.requests.get(identifier) || [];
        const validRequests = requests.filter(time => now - time < this.windowMs);
        return Math.max(0, this.maxRequests - validRequests.length);
    }
    getResetTime(identifier = 'global') {
        const requests = this.requests.get(identifier) || [];
        if (requests.length === 0)
            return 0;
        const oldestRequest = Math.min(...requests);
        return oldestRequest + this.windowMs;
    }
    // Clean up old entries periodically
    cleanup() {
        const now = Date.now();
        for (const [identifier, requests] of this.requests.entries()) {
            const validRequests = requests.filter(time => now - time < this.windowMs);
            if (validRequests.length === 0) {
                this.requests.delete(identifier);
            }
            else {
                this.requests.set(identifier, validRequests);
            }
        }
    }
}
//# sourceMappingURL=rate-limiter.js.map