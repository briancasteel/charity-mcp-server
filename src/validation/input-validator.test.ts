import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { EINValidator, SearchQueryValidator, LocationValidator, PaginationValidator } from './input-validator.js';
import { ValidationError } from '../utils/error-handler.js';

// Mock the logger
jest.mock('../utils/logger.js', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }
}));

describe('EINValidator', () => {
  describe('valid EINs', () => {
    it('should accept valid EIN with hyphen', () => {
      const result = EINValidator.validate('54-1234567');
      expect(result).toBe('54-1234567');
    });

    it('should accept valid EIN without hyphen', () => {
      const result = EINValidator.validate('541234567');
      expect(result).toBe('54-1234567');
    });

    it('should normalize EIN format', () => {
      const result = EINValidator.validate('12 3456789');
      expect(result).toBe('12-3456789');
    });

    it('should handle EIN with extra whitespace', () => {
      const result = EINValidator.validate('  54-1234567  ');
      expect(result).toBe('54-1234567');
    });
  });

  describe('invalid EINs', () => {
    it('should reject null or undefined', () => {
      expect(() => EINValidator.validate(null as any)).toThrow(ValidationError);
      expect(() => EINValidator.validate(undefined as any)).toThrow(ValidationError);
    });

    it('should reject non-string input', () => {
      expect(() => EINValidator.validate(123456789 as any)).toThrow(ValidationError);
    });

    it('should reject empty string', () => {
      expect(() => EINValidator.validate('')).toThrow(ValidationError);
      expect(() => EINValidator.validate('   ')).toThrow(ValidationError);
    });

    it('should reject wrong length', () => {
      expect(() => EINValidator.validate('12345678')).toThrow('EIN must be in format XX-XXXXXXX');
      expect(() => EINValidator.validate('1234567890')).toThrow('EIN must be in format XX-XXXXXXX');
    });

    it('should reject non-numeric characters', () => {
      expect(() => EINValidator.validate('AB-1234567')).toThrow('EIN must be in format XX-XXXXXXX');
      expect(() => EINValidator.validate('12-ABCDEFG')).toThrow('EIN must be in format XX-XXXXXXX');
    });

    it('should reject placeholder/test EINs', () => {
      expect(() => EINValidator.validate('00-0000000')).toThrow('placeholder or test number');
      expect(() => EINValidator.validate('11-1111111')).toThrow('placeholder or test number');
      expect(() => EINValidator.validate('12-3456789')).toThrow('placeholder or test number');
    });

    it('should reject reserved prefixes', () => {
      expect(() => EINValidator.validate('00-1234567')).toThrow('prefix 00 is reserved');
      expect(() => EINValidator.validate('07-1234567')).toThrow('prefix 07 is reserved');
      expect(() => EINValidator.validate('89-1234567')).toThrow('prefix 89 is reserved');
    });

    it('should reject invalid number sequences', () => {
      expect(() => EINValidator.validate('12-0000000')).toThrow('invalid number sequences');
    });
  });
});

describe('SearchQueryValidator', () => {
  describe('valid queries', () => {
    it('should accept valid search query', () => {
      const result = SearchQueryValidator.validate('Red Cross');
      expect(result).toBe('Red Cross');
    });

    it('should return undefined for empty input', () => {
      const result = SearchQueryValidator.validate(undefined);
      expect(result).toBeUndefined();
    });

    it('should return undefined for whitespace-only query', () => {
      const result = SearchQueryValidator.validate('   ');
      expect(result).toBeUndefined();
    });

    it('should trim whitespace from valid query', () => {
      const result = SearchQueryValidator.validate('  charity name  ');
      expect(result).toBe('charity name');
    });

    it('should accept query with reasonable special characters', () => {
      const result = SearchQueryValidator.validate("St. Mary's Foundation - Hope & Care");
      expect(result).toBe("St. Mary's Foundation - Hope & Care");
    });
  });

  describe('invalid queries', () => {
    it('should reject non-string input', () => {
      expect(() => SearchQueryValidator.validate(123 as any)).toThrow('must be a string');
    });

    it('should reject query too long', () => {
      const longQuery = 'a'.repeat(201);
      expect(() => SearchQueryValidator.validate(longQuery)).toThrow('cannot exceed 200 characters');
    });

    it('should reject script tags', () => {
      expect(() => SearchQueryValidator.validate('<script>alert("xss")</script>')).toThrow('forbidden patterns');
    });

    it('should reject iframe tags', () => {
      expect(() => SearchQueryValidator.validate('<iframe src="evil.com"></iframe>')).toThrow('forbidden patterns');
    });

    it('should reject javascript protocols', () => {
      expect(() => SearchQueryValidator.validate('javascript:alert(1)')).toThrow('forbidden patterns');
    });

    it('should reject event handlers', () => {
      expect(() => SearchQueryValidator.validate('onload=alert(1)')).toThrow('forbidden patterns');
      expect(() => SearchQueryValidator.validate('onclick=malicious()')).toThrow('forbidden patterns');
    });

    it('should reject eval expressions', () => {
      expect(() => SearchQueryValidator.validate('eval(malicious)')).toThrow('forbidden patterns');
    });

    it('should reject expression calls', () => {
      expect(() => SearchQueryValidator.validate('expression(malicious)')).toThrow('forbidden patterns');
    });

    it('should reject queries with too many special characters', () => {
      const specialCharQuery = '<>\'\"&;(){}[]<>\'\"&;(){}[]<>\'\"&;(){}[]';
      expect(() => SearchQueryValidator.validate(specialCharQuery)).toThrow('too many special characters');
    });
  });
});

describe('LocationValidator', () => {
  describe('state validation', () => {
    describe('valid states', () => {
      it('should accept valid state codes', () => {
        expect(LocationValidator.validateState('CA')).toBe('CA');
        expect(LocationValidator.validateState('NY')).toBe('NY');
        expect(LocationValidator.validateState('TX')).toBe('TX');
      });

      it('should normalize to uppercase', () => {
        expect(LocationValidator.validateState('ca')).toBe('CA');
        expect(LocationValidator.validateState('ny')).toBe('NY');
      });

      it('should handle whitespace', () => {
        expect(LocationValidator.validateState('  CA  ')).toBe('CA');
      });

      it('should accept territories', () => {
        expect(LocationValidator.validateState('DC')).toBe('DC');
        expect(LocationValidator.validateState('PR')).toBe('PR');
        expect(LocationValidator.validateState('VI')).toBe('VI');
      });

      it('should return undefined for empty input', () => {
        expect(LocationValidator.validateState(undefined)).toBeUndefined();
        expect(LocationValidator.validateState('')).toBeUndefined();
      });
    });

    describe('invalid states', () => {
      it('should reject non-string input', () => {
        expect(() => LocationValidator.validateState(123 as any)).toThrow('must be a string');
      });

      it('should reject wrong length', () => {
        expect(() => LocationValidator.validateState('C')).toThrow('2-letter abbreviation');
        expect(() => LocationValidator.validateState('CAL')).toThrow('2-letter abbreviation');
      });

      it('should reject invalid state codes', () => {
        expect(() => LocationValidator.validateState('XX')).toThrow('Invalid state code: XX');
        expect(() => LocationValidator.validateState('ZZ')).toThrow('Invalid state code: ZZ');
      });
    });
  });

  describe('city validation', () => {
    describe('valid cities', () => {
      it('should accept valid city names', () => {
        expect(LocationValidator.validateCity('San Francisco')).toBe('San Francisco');
        expect(LocationValidator.validateCity('New York')).toBe('New York');
      });

      it('should trim whitespace', () => {
        expect(LocationValidator.validateCity('  Boston  ')).toBe('Boston');
      });

      it('should return undefined for empty input', () => {
        expect(LocationValidator.validateCity(undefined)).toBeUndefined();
        expect(LocationValidator.validateCity('')).toBeUndefined();
        expect(LocationValidator.validateCity('   ')).toBeUndefined();
      });

      it('should accept cities with hyphens and apostrophes', () => {
        expect(LocationValidator.validateCity("St. Mary's")).toBe("St. Mary's");
        expect(LocationValidator.validateCity('Los Angeles-Long Beach')).toBe('Los Angeles-Long Beach');
      });
    });

    describe('invalid cities', () => {
      it('should reject non-string input', () => {
        expect(() => LocationValidator.validateCity(123 as any)).toThrow('must be a string');
      });

      it('should reject city names too long', () => {
        const longCity = 'a'.repeat(101);
        expect(() => LocationValidator.validateCity(longCity)).toThrow('cannot exceed 100 characters');
      });

      it('should reject cities with too many non-alphabetic characters', () => {
        expect(() => LocationValidator.validateCity('123456789')).toThrow('too many non-alphabetic characters');
        expect(() => LocationValidator.validateCity('@@@@@@@@')).toThrow('too many non-alphabetic characters');
      });
    });
  });
});

describe('PaginationValidator', () => {
  describe('limit validation', () => {
    it('should return default limit for undefined', () => {
      expect(PaginationValidator.validateLimit(undefined)).toBe(25);
    });

    it('should accept valid limits', () => {
      expect(PaginationValidator.validateLimit(1)).toBe(1);
      expect(PaginationValidator.validateLimit(50)).toBe(50);
      expect(PaginationValidator.validateLimit(100)).toBe(100);
    });

    it('should reject non-integer limits', () => {
      expect(() => PaginationValidator.validateLimit(1.5)).toThrow('must be an integer');
      expect(() => PaginationValidator.validateLimit('10' as any)).toThrow('must be an integer');
    });

    it('should reject limits below minimum', () => {
      expect(() => PaginationValidator.validateLimit(0)).toThrow('must be at least 1');
      expect(() => PaginationValidator.validateLimit(-1)).toThrow('must be at least 1');
    });

    it('should reject limits above maximum', () => {
      expect(() => PaginationValidator.validateLimit(101)).toThrow('cannot exceed 100');
      expect(() => PaginationValidator.validateLimit(1000)).toThrow('cannot exceed 100');
    });
  });

  describe('offset validation', () => {
    it('should return default offset for undefined', () => {
      expect(PaginationValidator.validateOffset(undefined)).toBe(0);
    });

    it('should accept valid offsets', () => {
      expect(PaginationValidator.validateOffset(0)).toBe(0);
      expect(PaginationValidator.validateOffset(100)).toBe(100);
      expect(PaginationValidator.validateOffset(5000)).toBe(5000);
    });

    it('should reject non-integer offsets', () => {
      expect(() => PaginationValidator.validateOffset(1.5)).toThrow('must be an integer');
      expect(() => PaginationValidator.validateOffset('10' as any)).toThrow('must be an integer');
    });

    it('should reject negative offsets', () => {
      expect(() => PaginationValidator.validateOffset(-1)).toThrow('cannot be negative');
      expect(() => PaginationValidator.validateOffset(-100)).toThrow('cannot be negative');
    });

    it('should reject offsets above maximum', () => {
      expect(() => PaginationValidator.validateOffset(10001)).toThrow('cannot exceed 10000');
      expect(() => PaginationValidator.validateOffset(50000)).toThrow('cannot exceed 10000');
    });
  });
});
