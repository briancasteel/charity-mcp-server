import { logger } from "../utils/logger.js";

export class InputSanitizer {
  /**
   * Sanitize text input by removing potentially harmful content
   */
  static sanitizeText(input: string | undefined): string | undefined {
    if (typeof input !== 'string') {
      return undefined;
    }
    
    if (input === '') {
      return undefined;
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

    // Remove script content first (before general HTML tag removal)
    sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gis, '');

    // Remove HTML tags - preserve surrounding spaces and add space where tags are removed
    sanitized = sanitized.replace(/<[^>]*>/g, ' ');

    // Remove SQL injection patterns (more targeted)
    // Remove SQL keywords
    sanitized = sanitized.replace(/\b(OR|AND|UNION|SELECT|INSERT|UPDATE|DELETE|DROP)\b/gi, '');
    
    // Remove quotes in SQL injection contexts (single quotes followed by semicolon, etc.)
    sanitized = sanitized.replace(/'(?=\s*;|$)|'(?=\s*(DROP|DELETE|INSERT|UPDATE|SELECT))/gi, '');
    
    // Remove semicolons and SQL comment markers
    sanitized = sanitized.replace(/(;|--)/g, '');
    
    // Remove excessive punctuation (3 or more consecutive special chars)
    // Exclude apostrophes from this to preserve contractions like "Mary's"
    sanitized = sanitized.replace(/[!@#$%^&*()_+={}|[\]\\:";,<>?./]{3,}/g, '');

    // Normalize whitespace - convert any sequence of whitespace to single space
    sanitized = sanitized.replace(/\s+/g, ' ');
    
    // Trim leading and trailing spaces
    sanitized = sanitized.trim();

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
