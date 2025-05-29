import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { RateLimiter } from './rate-limiter.js';

// Mock the logger
jest.mock('../utils/logger.js', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }
}));

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;
  let mockDateNow: jest.SpiedFunction<typeof Date.now>;
  let currentTime: number;

  beforeEach(() => {
    currentTime = 1000000; // Starting time
    mockDateNow = jest.spyOn(Date, 'now').mockImplementation(() => currentTime);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create rate limiter with specified parameters', () => {
      rateLimiter = new RateLimiter(10, 60000); // 10 requests per minute
      
      expect(rateLimiter).toBeInstanceOf(RateLimiter);
      expect((rateLimiter as any).maxRequests).toBe(10);
      expect((rateLimiter as any).windowMs).toBe(60000);
    });

    it('should initialize with empty requests map', () => {
      rateLimiter = new RateLimiter(5, 30000);
      
      expect((rateLimiter as any).requests).toBeInstanceOf(Map);
      expect((rateLimiter as any).requests.size).toBe(0);
    });
  });

  describe('checkRateLimit', () => {
    beforeEach(() => {
      rateLimiter = new RateLimiter(3, 1000); // 3 requests per second for easy testing
    });

    describe('within rate limit', () => {
      it('should allow first request', async () => {
        const result = await rateLimiter.checkRateLimit();
        expect(result).toBe(true);
      });

      it('should allow requests up to the limit', async () => {
        const result1 = await rateLimiter.checkRateLimit();
        const result2 = await rateLimiter.checkRateLimit();
        const result3 = await rateLimiter.checkRateLimit();
        
        expect(result1).toBe(true);
        expect(result2).toBe(true);
        expect(result3).toBe(true);
      });

      it('should allow requests after window expires', async () => {
        // Use up the limit
        await rateLimiter.checkRateLimit();
        await rateLimiter.checkRateLimit();
        await rateLimiter.checkRateLimit();
        
        // Try another request - should be denied
        const result4 = await rateLimiter.checkRateLimit();
        expect(result4).toBe(false);
        
        // Move time forward past the window
        currentTime += 1001; // Window is 1000ms, so this clears it
        
        // Should be allowed again
        const result5 = await rateLimiter.checkRateLimit();
        expect(result5).toBe(true);
      });
    });

    describe('rate limit exceeded', () => {
      it('should deny request when limit is exceeded', async () => {
        // Use up the limit
        await rateLimiter.checkRateLimit();
        await rateLimiter.checkRateLimit();
        await rateLimiter.checkRateLimit();
        
        // This should be denied
        const result = await rateLimiter.checkRateLimit();
        expect(result).toBe(false);
      });

      it('should continue to deny requests until window expires', async () => {
        // Use up the limit
        await rateLimiter.checkRateLimit();
        await rateLimiter.checkRateLimit();
        await rateLimiter.checkRateLimit();
        
        // Multiple denials
        const result1 = await rateLimiter.checkRateLimit();
        const result2 = await rateLimiter.checkRateLimit();
        
        expect(result1).toBe(false);
        expect(result2).toBe(false);
      });
    });

    describe('sliding window behavior', () => {
      it('should allow new requests as old ones expire', async () => {
        // Make first request
        await rateLimiter.checkRateLimit();
        
        // Move time forward 500ms and make more requests
        currentTime += 500;
        await rateLimiter.checkRateLimit();
        await rateLimiter.checkRateLimit();
        
        // Should be at limit now
        const result4 = await rateLimiter.checkRateLimit();
        expect(result4).toBe(false);
        
        // Move time forward another 501ms (total 1001ms from first request)
        // This should expire the first request
        currentTime += 501;
        
        // Should be allowed again
        const result5 = await rateLimiter.checkRateLimit();
        expect(result5).toBe(true);
      });
    });

    describe('multiple identifiers', () => {
      it('should track different identifiers separately', async () => {
        // Use up limit for user1
        await rateLimiter.checkRateLimit('user1');
        await rateLimiter.checkRateLimit('user1');
        await rateLimiter.checkRateLimit('user1');
        
        // user1 should be denied
        const result1 = await rateLimiter.checkRateLimit('user1');
        expect(result1).toBe(false);
        
        // user2 should still be allowed
        const result2 = await rateLimiter.checkRateLimit('user2');
        expect(result2).toBe(true);
      });

      it('should use global identifier by default', async () => {
        await rateLimiter.checkRateLimit(); // global
        await rateLimiter.checkRateLimit(); // global
        await rateLimiter.checkRateLimit(); // global
        
        // Both should be denied since they use the same global identifier
        const result1 = await rateLimiter.checkRateLimit();
        const result2 = await rateLimiter.checkRateLimit('global');
        
        expect(result1).toBe(false);
        expect(result2).toBe(false);
      });
    });
  });

  describe('getRemainingRequests', () => {
    beforeEach(() => {
      rateLimiter = new RateLimiter(5, 1000);
    });

    it('should return max requests when no requests made', () => {
      const remaining = rateLimiter.getRemainingRequests();
      expect(remaining).toBe(5);
    });

    it('should return correct remaining count after requests', async () => {
      await rateLimiter.checkRateLimit();
      expect(rateLimiter.getRemainingRequests()).toBe(4);
      
      await rateLimiter.checkRateLimit();
      expect(rateLimiter.getRemainingRequests()).toBe(3);
      
      await rateLimiter.checkRateLimit();
      expect(rateLimiter.getRemainingRequests()).toBe(2);
    });

    it('should return 0 when limit is reached', async () => {
      // Use up all requests
      for (let i = 0; i < 5; i++) {
        await rateLimiter.checkRateLimit();
      }
      
      expect(rateLimiter.getRemainingRequests()).toBe(0);
    });

    it('should update as old requests expire', async () => {
      // Use up all requests
      for (let i = 0; i < 5; i++) {
        await rateLimiter.checkRateLimit();
      }
      expect(rateLimiter.getRemainingRequests()).toBe(0);
      
      // Move time forward to expire requests
      currentTime += 1001;
      
      expect(rateLimiter.getRemainingRequests()).toBe(5);
    });

    it('should track different identifiers separately', async () => {
      await rateLimiter.checkRateLimit('user1');
      await rateLimiter.checkRateLimit('user1');
      
      expect(rateLimiter.getRemainingRequests('user1')).toBe(3);
      expect(rateLimiter.getRemainingRequests('user2')).toBe(5);
    });
  });

  describe('getResetTime', () => {
    beforeEach(() => {
      rateLimiter = new RateLimiter(3, 1000);
    });

    it('should return 0 when no requests made', () => {
      const resetTime = rateLimiter.getResetTime();
      expect(resetTime).toBe(0);
    });

    it('should return correct reset time after first request', async () => {
      await rateLimiter.checkRateLimit();
      
      const resetTime = rateLimiter.getResetTime();
      expect(resetTime).toBe(currentTime + 1000);
    });

    it('should return reset time based on oldest request', async () => {
      const startTime = currentTime;
      
      await rateLimiter.checkRateLimit();
      
      currentTime += 200;
      await rateLimiter.checkRateLimit();
      
      currentTime += 300;
      await rateLimiter.checkRateLimit();
      
      // Reset time should be based on the first (oldest) request
      const resetTime = rateLimiter.getResetTime();
      expect(resetTime).toBe(startTime + 1000);
    });

    it('should track different identifiers separately', async () => {
      await rateLimiter.checkRateLimit('user1');
      
      currentTime += 500;
      await rateLimiter.checkRateLimit('user2');
      
      expect(rateLimiter.getResetTime('user1')).toBe(currentTime - 500 + 1000);
      expect(rateLimiter.getResetTime('user2')).toBe(currentTime + 1000);
    });
  });

  describe('cleanup', () => {
    beforeEach(() => {
      rateLimiter = new RateLimiter(3, 1000);
    });

    it('should remove expired entries completely', async () => {
      await rateLimiter.checkRateLimit('user1');
      await rateLimiter.checkRateLimit('user2');
      
      // Move time forward to expire all requests
      currentTime += 1001;
      
      rateLimiter.cleanup();
      
      // Both identifiers should be cleaned up
      expect((rateLimiter as any).requests.size).toBe(0);
    });

    it('should keep valid entries and remove expired ones', async () => {
      await rateLimiter.checkRateLimit('user1');
      
      currentTime += 500;
      await rateLimiter.checkRateLimit('user2');
      
      // Move time forward to expire only user1's requests
      currentTime += 501;
      
      rateLimiter.cleanup();
      
      // user1 should be removed, user2 should remain
      expect((rateLimiter as any).requests.has('user1')).toBe(false);
      expect((rateLimiter as any).requests.has('user2')).toBe(true);
    });

    it('should clean up partial expired requests from an identifier', async () => {
      // Make requests at different times for same user
      await rateLimiter.checkRateLimit('user1');
      
      currentTime += 500;
      await rateLimiter.checkRateLimit('user1');
      
      currentTime += 600; // Total 1100ms from first request
      
      rateLimiter.cleanup();
      
      // user1 should still exist but with only 1 request
      const requests = (rateLimiter as any).requests.get('user1');
      expect(requests).toBeDefined();
      expect(requests.length).toBe(1);
    });

    it('should not affect rate limiting after cleanup', async () => {
      await rateLimiter.checkRateLimit('user1');
      await rateLimiter.checkRateLimit('user1');
      
      currentTime += 1001;
      rateLimiter.cleanup();
      
      // Should be able to make requests again
      const result = await rateLimiter.checkRateLimit('user1');
      expect(result).toBe(true);
    });

    it('should handle empty requests map', () => {
      expect(() => rateLimiter.cleanup()).not.toThrow();
      expect((rateLimiter as any).requests.size).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle zero max requests', () => {
      rateLimiter = new RateLimiter(0, 1000);
      
      expect(rateLimiter.checkRateLimit()).resolves.toBe(false);
      expect(rateLimiter.getRemainingRequests()).toBe(0);
    });

    it('should handle very small time windows', async () => {
      rateLimiter = new RateLimiter(2, 1); // 1ms window
      
      await rateLimiter.checkRateLimit();
      await rateLimiter.checkRateLimit();
      
      // Should be at limit
      expect(await rateLimiter.checkRateLimit()).toBe(false);
      
      // Move time forward by 2ms to clear window
      currentTime += 2;
      
      // Should be allowed again
      expect(await rateLimiter.checkRateLimit()).toBe(true);
    });

    it('should handle large numbers of requests', async () => {
      rateLimiter = new RateLimiter(1000, 60000);
      
      // Make many requests
      for (let i = 0; i < 1000; i++) {
        const result = await rateLimiter.checkRateLimit();
        expect(result).toBe(true);
      }
      
      // 1001st request should be denied
      expect(await rateLimiter.checkRateLimit()).toBe(false);
    });
  });
});
