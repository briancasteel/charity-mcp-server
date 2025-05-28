import { logger } from "../utils/logger.js";

export class InputSanitizer {
  /**
   * Sanitize text input by removing potentially harmful content
   */
  static sanitizeText(input: string | undefined): string | undefined {
    if (!input || typeof input !== 'string') {
      return input as undefined;
    }

    logger.debug("Sanitizing text input", { originalLength: input.length });

    let sanitized = input;

    // Remove null bytes
    sanitized = sanitized.replace(/\x00/g, '');

    // Remove control characters except newlines and tabs
    sanitized = sanitized.replace(/[\x01-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

    // Normalize whitespace
    sanitized = sanitized.replace(/\s+/g, ' ');

    // Trim
    sanitized = sanitized.trim();

    logger.debug("Text sanitization complete", { 
      originalLength: input.length, 
      sanitizedLength: sanitized.length 
    });

    return sanitized.length > 0 ? sanitized : undefined;
  }

  /**
   * Sanitize EIN input
   */
  static sanitizeEIN(ein: string): string {
    if (!ein || typeof ein !== 'string') {
      return '';
    }

    // Remove all non-digit and non-hyphen characters
    let sanitized = ein.replace(/[^\d-]/g, '');

    // Remove multiple consecutive hyphens
    sanitized = sanitized.replace(/-+/g, '-');

    // Remove leading/trailing hyphens
    sanitized = sanitized.replace(/^-+|-+$/g, '');

    return sanitized;
  }

  /**
   * Sanitize search query for API calls
   */
  static sanitizeSearchQuery(query: string): string {
    if (!query || typeof query !== 'string') {
      return '';
    }

    let sanitized = query;

    // Remove HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    // Remove script content
    sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');

    // Remove SQL injection patterns
    sanitized = sanitized.replace(/('|(\\')|(;|--)|(\*|%)|(\bOR\b|\bAND\b|\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b))/gi, '');

    // Remove excessive punctuation
    sanitized = sanitized.replace(/[!@#$%^&*()_+={}|[\]\\:";'<>?,./]{3,}/g, '');

    // Normalize spaces
    sanitized = sanitized.replace(/\s+/g, ' ').trim();

    return sanitized;
  }

  /**
   * Sanitize numeric inputs
   */
  static sanitizeNumber(input: any, defaultValue: number = 0): number {
    if (typeof input === 'number' && !isNaN(input) && isFinite(input)) {
      return Math.floor(input); // Ensure integer
    }

    if (typeof input === 'string') {
      const parsed = parseInt(input, 10);
      if (!isNaN(parsed) && isFinite(parsed)) {
        return parsed;
      }
    }

    return defaultValue;
  }
}
