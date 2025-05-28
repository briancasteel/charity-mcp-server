import { z } from "zod";
import { ValidationError } from "../utils/error-handler.js";
import { logger } from "../utils/logger.js";

// Enhanced EIN validation with more comprehensive checks
export class EINValidator {
  private static readonly INVALID_EINS = new Set([
    "00-0000000", "11-1111111", "22-2222222", "33-3333333", 
    "44-4444444", "55-5555555", "66-6666666", "77-7777777", 
    "88-8888888", "99-9999999", "12-3456789"
  ]);

  private static readonly RESERVED_PREFIXES = new Set([
    "00", "07", "08", "09", "17", "18", "19", "28", "29", 
    "49", "69", "70", "78", "79", "89"
  ]);

  static validate(ein: string): string {
    logger.debug("Validating EIN", { ein });

    if (!ein || typeof ein !== 'string') {
      throw new ValidationError("EIN is required and must be a string", "ein");
    }

    // Remove whitespace and normalize
    const cleanEIN = ein.trim().replace(/\s+/g, '');
    
    if (cleanEIN.length === 0) {
      throw new ValidationError("EIN cannot be empty", "ein");
    }

    // Check basic format
    const einRegex = /^(\d{2})-?(\d{7})$/;
    const match = cleanEIN.match(einRegex);
    
    if (!match) {
      throw new ValidationError(
        "EIN must be in format XX-XXXXXXX or XXXXXXXXX with exactly 9 digits", 
        "ein"
      );
    }

    const [, prefix, suffix] = match;
    const formattedEIN = `${prefix}-${suffix}`;

    // Check for obviously invalid EINs
    if (this.INVALID_EINS.has(formattedEIN)) {
      throw new ValidationError("Invalid EIN: appears to be a placeholder or test number", "ein");
    }

    // Check for reserved prefixes that are never assigned
    if (this.RESERVED_PREFIXES.has(prefix)) {
      throw new ValidationError(`Invalid EIN: prefix ${prefix} is reserved and not assigned`, "ein");
    }

    // Additional business logic validations
    if (prefix === "00" || suffix === "0000000") {
      throw new ValidationError("Invalid EIN: contains invalid number sequences", "ein");
    }

    logger.debug("EIN validation successful", { originalEIN: ein, formattedEIN });
    return formattedEIN;
  }
}

// Enhanced search query validation
export class SearchQueryValidator {
  private static readonly MAX_QUERY_LENGTH = 200;
  private static readonly MIN_QUERY_LENGTH = 1;
  private static readonly FORBIDDEN_PATTERNS = [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi,
  ];

  static validate(query: string | undefined): string | undefined {
    if (!query) {
      return undefined;
    }

    logger.debug("Validating search query", { originalQuery: query });

    if (typeof query !== 'string') {
      throw new ValidationError("Search query must be a string", "query");
    }

    // Length validation
    if (query.length < this.MIN_QUERY_LENGTH) {
      throw new ValidationError(
        `Search query must be at least ${this.MIN_QUERY_LENGTH} character(s)`, 
        "query"
      );
    }

    if (query.length > this.MAX_QUERY_LENGTH) {
      throw new ValidationError(
        `Search query cannot exceed ${this.MAX_QUERY_LENGTH} characters`, 
        "query"
      );
    }

    // Security validation - check for potentially malicious patterns
    for (const pattern of this.FORBIDDEN_PATTERNS) {
      if (pattern.test(query)) {
        throw new ValidationError("Search query contains forbidden patterns", "query");
      }
    }

    // Check for excessive special characters that might indicate injection attempts
    const specialCharCount = (query.match(/[<>'"&;(){}[\]]/g) || []).length;
    if (specialCharCount > query.length * 0.3) {
      throw new ValidationError("Search query contains too many special characters", "query");
    }

    const validatedQuery = query.trim();
    
    if (validatedQuery.length === 0) {
      return undefined;
    }

    logger.debug("Search query validation successful", { validatedQuery });
    return validatedQuery;
  }
}

// Location validation utilities
export class LocationValidator {
  private static readonly US_STATES = new Set([
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
    'DC', 'PR', 'VI', 'GU', 'AS', 'MP'
  ]);

  static validateState(state: string | undefined): string | undefined {
    if (!state) {
      return undefined;
    }

    logger.debug("Validating state", { state });

    if (typeof state !== 'string') {
      throw new ValidationError("State must be a string", "state");
    }

    const normalizedState = state.trim().toUpperCase();
    
    if (normalizedState.length !== 2) {
      throw new ValidationError("State must be a 2-letter abbreviation", "state");
    }

    if (!this.US_STATES.has(normalizedState)) {
      throw new ValidationError(
        `Invalid state code: ${normalizedState}. Must be a valid US state/territory abbreviation.`,
        "state"
      );
    }

    logger.debug("State validation successful", { normalizedState });
    return normalizedState;
  }

  static validateCity(city: string | undefined): string | undefined {
    if (!city) {
      return undefined;
    }

    logger.debug("Validating city", { city });

    if (typeof city !== 'string') {
      throw new ValidationError("City must be a string", "city");
    }

    const trimmedCity = city.trim();
    
    if (trimmedCity.length === 0) {
      return undefined;
    }

    if (trimmedCity.length > 100) {
      throw new ValidationError("City name cannot exceed 100 characters", "city");
    }

    // Basic sanity check - city names should be mostly alphabetic
    const alphaCount = (trimmedCity.match(/[a-zA-Z]/g) || []).length;
    if (alphaCount < trimmedCity.length * 0.6) {
      throw new ValidationError("City name contains too many non-alphabetic characters", "city");
    }

    logger.debug("City validation successful", { validatedCity: trimmedCity });
    return trimmedCity;
  }
}

// Pagination validation
export class PaginationValidator {
  private static readonly MAX_LIMIT = 100;
  private static readonly MIN_LIMIT = 1;
  private static readonly MAX_OFFSET = 10000;

  static validateLimit(limit: number | undefined): number {
    const defaultLimit = 25;
    
    if (limit === undefined) {
      return defaultLimit;
    }

    if (typeof limit !== 'number' || !Number.isInteger(limit)) {
      throw new ValidationError("Limit must be an integer", "limit");
    }

    if (limit < this.MIN_LIMIT) {
      throw new ValidationError(`Limit must be at least ${this.MIN_LIMIT}`, "limit");
    }

    if (limit > this.MAX_LIMIT) {
      throw new ValidationError(`Limit cannot exceed ${this.MAX_LIMIT}`, "limit");
    }

    return limit;
  }

  static validateOffset(offset: number | undefined): number {
    const defaultOffset = 0;
    
    if (offset === undefined) {
      return defaultOffset;
    }

    if (typeof offset !== 'number' || !Number.isInteger(offset)) {
      throw new ValidationError("Offset must be an integer", "offset");
    }

    if (offset < 0) {
      throw new ValidationError("Offset cannot be negative", "offset");
    }

    if (offset > this.MAX_OFFSET) {
      throw new ValidationError(`Offset cannot exceed ${this.MAX_OFFSET}`, "offset");
    }

    return offset;
  }
}
