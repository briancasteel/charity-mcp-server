import { describe, it, expect, jest } from '@jest/globals';
import { InputSanitizer } from './input-sanitizer.js';

// Mock the logger
jest.mock('../utils/logger.js', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }
}));

describe('InputSanitizer', () => {
  describe('sanitizeText', () => {
    describe('valid inputs', () => {
      it('should return clean text unchanged', () => {
        const result = InputSanitizer.sanitizeText('Clean text input');
        expect(result).toBe('Clean text input');
      });

      it('should normalize multiple spaces', () => {
        const result = InputSanitizer.sanitizeText('Text   with    multiple     spaces');
        expect(result).toBe('Text with multiple spaces');
      });

      it('should trim whitespace', () => {
        const result = InputSanitizer.sanitizeText('  Trimmed text  ');
        expect(result).toBe('Trimmed text');
      });

      it('should preserve newlines and tabs when normalizing', () => {
        const result = InputSanitizer.sanitizeText('Text\twith\ttabs\nand\nnewlines');
        expect(result).toBe('Text with tabs and newlines');
      });
    });

    describe('edge cases', () => {
      it('should return undefined for undefined input', () => {
        const result = InputSanitizer.sanitizeText(undefined);
        expect(result).toBeUndefined();
      });

      it('should return undefined for empty string', () => {
        const result = InputSanitizer.sanitizeText('');
        expect(result).toBeUndefined();
      });

      it('should return undefined for whitespace-only string', () => {
        const result = InputSanitizer.sanitizeText('   ');
        expect(result).toBeUndefined();
      });

      it('should return undefined for non-string input', () => {
        const result = InputSanitizer.sanitizeText(123 as any);
        expect(result).toBeUndefined();
      });
    });

    describe('harmful content removal', () => {
      it('should remove null bytes', () => {
        const result = InputSanitizer.sanitizeText('Text\x00with\x00nulls');
        expect(result).toBe('Textwithnulls');
      });

      it('should remove control characters', () => {
        const result = InputSanitizer.sanitizeText('Text\x01\x02\x03with\x1Fcontrol\x7Fchars');
        expect(result).toBe('Textwithcontrolchars');
      });

      it('should preserve allowed whitespace characters', () => {
        const result = InputSanitizer.sanitizeText('Text\twith\nallowed\rwhitespace');
        expect(result).toBe('Text with allowed whitespace');
      });
    });
  });

  describe('sanitizeEIN', () => {
    describe('valid inputs', () => {
      it('should preserve valid EIN format', () => {
        const result = InputSanitizer.sanitizeEIN('12-3456789');
        expect(result).toBe('12-3456789');
      });

      it('should preserve EIN without hyphen', () => {
        const result = InputSanitizer.sanitizeEIN('123456789');
        expect(result).toBe('123456789');
      });
    });

    describe('sanitization', () => {
      it('should remove non-digit, non-hyphen characters', () => {
        const result = InputSanitizer.sanitizeEIN('12-ABC3456DEF789GHI');
        expect(result).toBe('12-3456789');
      });

      it('should remove letters and special characters', () => {
        const result = InputSanitizer.sanitizeEIN('EIN: 12-3456789 (Federal)');
        expect(result).toBe('12-3456789');
      });

      it('should remove multiple consecutive hyphens', () => {
        const result = InputSanitizer.sanitizeEIN('12--3456789');
        expect(result).toBe('12-3456789');
      });

      it('should remove leading and trailing hyphens', () => {
        const result = InputSanitizer.sanitizeEIN('-12-3456789-');
        expect(result).toBe('12-3456789');
      });

      it('should handle complex messy input', () => {
        const result = InputSanitizer.sanitizeEIN('--EIN#12@@3456789!!--');
        expect(result).toBe('123456789');
      });
    });

    describe('edge cases', () => {
      it('should return empty string for undefined', () => {
        const result = InputSanitizer.sanitizeEIN(undefined as any);
        expect(result).toBe('');
      });

      it('should return empty string for empty string', () => {
        const result = InputSanitizer.sanitizeEIN('');
        expect(result).toBe('');
      });

      it('should return empty string for non-string input', () => {
        const result = InputSanitizer.sanitizeEIN(123456789 as any);
        expect(result).toBe('');
      });

      it('should return empty string for input with no digits', () => {
        const result = InputSanitizer.sanitizeEIN('ABCDEFGHI');
        expect(result).toBe('');
      });
    });
  });

  describe('sanitizeSearchQuery', () => {
    describe('valid inputs', () => {
      it('should preserve clean search queries', () => {
        const result = InputSanitizer.sanitizeSearchQuery('American Red Cross');
        expect(result).toBe('American Red Cross');
      });

      it('should preserve apostrophes and hyphens', () => {
        const result = InputSanitizer.sanitizeSearchQuery("St. Mary's Hospital");
        expect(result).toBe("St. Mary's Hospital");
      });
    });

    describe('HTML removal', () => {
      it('should remove HTML tags', () => {
        const result = InputSanitizer.sanitizeSearchQuery('<b>Bold</b> and <i>italic</i> text');
        expect(result).toBe('Bold italic text');
      });

      it('should remove script tags and content', () => {
        const result = InputSanitizer.sanitizeSearchQuery('Search <script>alert("xss")</script> query');
        expect(result).toBe('Search query');
      });

      it('should remove malformed HTML', () => {
        const result = InputSanitizer.sanitizeSearchQuery('Text with <unclosed tag and >broken< html');
        expect(result).toBe('Text with broken< html');
      });
    });

    describe('SQL injection protection', () => {
      it('should remove SQL keywords', () => {
        const result = InputSanitizer.sanitizeSearchQuery('charity OR 1=1');
        expect(result).toBe('charity 1=1');
      });

      it('should remove quotes and semicolons', () => {
        const result = InputSanitizer.sanitizeSearchQuery("charity'; DROP TABLE users;--");
        expect(result).toBe('charity TABLE users');
      });

      it('should remove SQL injection patterns case-insensitively', () => {
        const result = InputSanitizer.sanitizeSearchQuery('charity union select password from users');
        expect(result).toBe('charity password from users');
      });
    });

    describe('excessive punctuation removal', () => {
      it('should remove excessive punctuation sequences', () => {
        const result = InputSanitizer.sanitizeSearchQuery('charity!!!@@###$$$%%%');
        expect(result).toBe('charity');
      });

      it('should preserve reasonable punctuation', () => {
        const result = InputSanitizer.sanitizeSearchQuery('St. Mary\'s Hospital - Hope & Care');
        expect(result).toBe('St. Mary\'s Hospital - Hope & Care');
      });
    });

    describe('whitespace normalization', () => {
      it('should normalize multiple spaces', () => {
        const result = InputSanitizer.sanitizeSearchQuery('charity    with    spaces');
        expect(result).toBe('charity with spaces');
      });

      it('should trim leading and trailing spaces', () => {
        const result = InputSanitizer.sanitizeSearchQuery('  trimmed query  ');
        expect(result).toBe('trimmed query');
      });
    });

    describe('edge cases', () => {
      it('should return empty string for undefined', () => {
        const result = InputSanitizer.sanitizeSearchQuery(undefined as any);
        expect(result).toBe('');
      });

      it('should return empty string for empty string', () => {
        const result = InputSanitizer.sanitizeSearchQuery('');
        expect(result).toBe('');
      });

      it('should return empty string for non-string input', () => {
        const result = InputSanitizer.sanitizeSearchQuery(123 as any);
        expect(result).toBe('');
      });

      it('should remove script tags but preserve content', () => {
        const result = InputSanitizer.sanitizeSearchQuery('<script>alert(1)</script>');
        expect(result).toBe('');
      });
    });
  });

  describe('sanitizeNumber', () => {
    describe('valid number inputs', () => {
      it('should return integer for valid number', () => {
        expect(InputSanitizer.sanitizeNumber(42)).toBe(42);
        expect(InputSanitizer.sanitizeNumber(0)).toBe(0);
        expect(InputSanitizer.sanitizeNumber(-5)).toBe(-5);
      });

      it('should floor decimal numbers', () => {
        expect(InputSanitizer.sanitizeNumber(42.7)).toBe(42);
        expect(InputSanitizer.sanitizeNumber(99.9)).toBe(99);
        expect(InputSanitizer.sanitizeNumber(-3.8)).toBe(-4);
      });
    });

    describe('string inputs', () => {
      it('should parse valid numeric strings', () => {
        expect(InputSanitizer.sanitizeNumber('42')).toBe(42);
        expect(InputSanitizer.sanitizeNumber('0')).toBe(0);
        expect(InputSanitizer.sanitizeNumber('-5')).toBe(-5);
      });

      it('should parse strings with decimal parts', () => {
        expect(InputSanitizer.sanitizeNumber('42.7')).toBe(42);
        expect(InputSanitizer.sanitizeNumber('99.9')).toBe(99);
      });

      it('should ignore trailing non-numeric characters', () => {
        expect(InputSanitizer.sanitizeNumber('42abc')).toBe(42);
        expect(InputSanitizer.sanitizeNumber('123.45xyz')).toBe(123);
      });
    });

    describe('invalid inputs', () => {
      it('should return default for NaN', () => {
        expect(InputSanitizer.sanitizeNumber(NaN)).toBe(0);
        expect(InputSanitizer.sanitizeNumber(NaN, 99)).toBe(99);
      });

      it('should return default for Infinity', () => {
        expect(InputSanitizer.sanitizeNumber(Infinity)).toBe(0);
        expect(InputSanitizer.sanitizeNumber(-Infinity)).toBe(0);
      });

      it('should return default for non-numeric strings', () => {
        expect(InputSanitizer.sanitizeNumber('abc')).toBe(0);
        expect(InputSanitizer.sanitizeNumber('abc', 42)).toBe(42);
      });

      it('should return default for empty string', () => {
        expect(InputSanitizer.sanitizeNumber('')).toBe(0);
        expect(InputSanitizer.sanitizeNumber('', 100)).toBe(100);
      });

      it('should return default for null/undefined', () => {
        expect(InputSanitizer.sanitizeNumber(null)).toBe(0);
        expect(InputSanitizer.sanitizeNumber(undefined)).toBe(0);
        expect(InputSanitizer.sanitizeNumber(null, 50)).toBe(50);
      });

      it('should return default for objects', () => {
        expect(InputSanitizer.sanitizeNumber({})).toBe(0);
        expect(InputSanitizer.sanitizeNumber([])).toBe(0);
        expect(InputSanitizer.sanitizeNumber({ value: 42 })).toBe(0);
      });
    });

    describe('custom default values', () => {
      it('should use custom default for invalid inputs', () => {
        expect(InputSanitizer.sanitizeNumber('invalid', 999)).toBe(999);
        expect(InputSanitizer.sanitizeNumber(NaN, -1)).toBe(-1);
        expect(InputSanitizer.sanitizeNumber(undefined, 42)).toBe(42);
      });
    });
  });
});
