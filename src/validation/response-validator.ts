import { z } from "zod";
import { logger } from "../utils/logger.js";
import { CharityAPIError } from "../utils/error-handler.js";

// API response schemas for validation
const CharityLookupAPIResponseSchema = z.object({
  data: z.object({
    ein: z.string().optional(),
    name: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    deductibilityCode: z.string().optional(),
    deductibilityDetail: z.string().optional(),
    eligibilityEin: z.string().optional(),
    eligibilityName: z.string().optional(),
    eligibilityState: z.string().optional(),
    eligibilitySubsectionCode: z.string().optional(),
    eligibilitySubsectionDetail: z.string().optional(),
    eligibilityAffiliation: z.string().optional(),
    eligibilityClassification: z.string().optional(),
    eligibilityRuling: z.string().optional(),
    eligibilityDeductibility: z.string().optional(),
    eligibilityFoundation: z.string().optional(),
    eligibilityActivity: z.string().optional(),
    eligibilityOrganization: z.string().optional(),
    eligibilityStatus: z.string().optional(),
    eligibilityAdvancedRuling: z.string().optional(),
  }).optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

const PublicCharityCheckAPIResponseSchema = z.object({
  data: z.object({
    public_charity: z.boolean().optional(),
    ein: z.string().optional(),
  }).optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

const CharitySearchAPIResponseSchema = z.object({
  data: z.array(z.object({
    ein: z.string().optional(),
    name: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    deductibilityCode: z.string().optional(),
  })).optional(),
  pagination: z.object({
    page: z.number().optional(),
    totalPages: z.number().optional(),
    totalResults: z.number().optional(),
  }).optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export class ResponseValidator {
  /**
   * Validate charity lookup API response
   */
  static validateCharityLookupResponse(response: any): any {
    return this.validateGetOrgResponse(response);
  }

  /**
   * Validate charity lookup API response (internal method)
   */
  static validateGetOrgResponse(response: any): any {
    logger.debug("Validating charity lookup response", { responseType: typeof response });

    try {
      const validated = CharityLookupAPIResponseSchema.parse(response);
      
      if (validated.error) {
        throw new CharityAPIError(`API Error: ${validated.error}`, 400);
      }

      if (!validated.data) {
        throw new CharityAPIError("No data returned from API", 404);
      }

      // Additional business logic validation
      if (!validated.data.ein && !validated.data.name) {
        throw new CharityAPIError("Invalid response: missing both EIN and name", 400);
      }

      logger.debug("Charity lookup response validation successful");
      return validated;
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error("Charity lookup response schema validation failed", { 
          errors: error.errors,
          receivedData: response 
        });
        throw new CharityAPIError("Invalid response format from CharityAPI", 500);
      }
      throw error;
    }
  }

  /**
   * Validate public charity check API response
   */
  static validatePublicCharityCheckResponse(response: any): any {
    logger.debug("Validating public charity check response", { responseType: typeof response });

    try {
      const validated = PublicCharityCheckAPIResponseSchema.parse(response);
      
      if (validated.error) {
        throw new CharityAPIError(`API Error: ${validated.error}`, 400);
      }

      if (!validated.data) {
        throw new CharityAPIError("No data returned from API", 404);
      }

      // Additional validation
      if (validated.data.public_charity === undefined) {
        throw new CharityAPIError("Invalid response: public_charity status not provided", 400);
      }

      if (!validated.data.ein) {
        throw new CharityAPIError("Invalid response: EIN not provided", 400);
      }

      logger.debug("Public charity check response validation successful");
      return validated;
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error("Public charity check response schema validation failed", { 
          errors: error.errors,
          receivedData: response 
        });
        throw new CharityAPIError("Invalid response format from CharityAPI", 500);
      }
      throw error;
    }
  }

  /**
   * Validate charity search API response
   */
  static validateCharitySearchResponse(response: any): any {
    logger.debug("Validating charity search response", { responseType: typeof response });

    try {
      const validated = CharitySearchAPIResponseSchema.parse(response);
      
      if (validated.error) {
        throw new CharityAPIError(`API Error: ${validated.error}`, 400);
      }

      // Handle case where data might be empty array
      const results = validated.data || [];
      
      // Validate individual charity entries
      results.forEach((charity, index) => {
        if (!charity.ein || !charity.name) {
          logger.warn(`Invalid charity entry at index ${index}`, { charity });
        }
      });

      logger.debug("Charity search response validation successful", { 
        resultCount: results.length 
      });
      
      return {
        ...validated,
        data: results,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error("Charity search response schema validation failed", { 
          errors: error.errors,
          receivedData: response 
        });
        throw new CharityAPIError("Invalid response format from CharityAPI", 500);
      }
      throw error;
    }
  }

  /**
   * Generic response health check
   */
  static validateResponseHealth(response: any, endpoint: string): void {
    if (!response) {
      throw new CharityAPIError(`No response received from ${endpoint}`, 500);
    }

    if (typeof response !== 'object') {
      throw new CharityAPIError(`Invalid response type from ${endpoint}: expected object`, 500);
    }

    // Check for common error indicators
    if (response.error === 'unauthorized' || response.status === 401) {
      throw new CharityAPIError("API key is invalid or unauthorized", 401);
    }

    if (response.error === 'rate_limited' || response.status === 429) {
      throw new CharityAPIError("Rate limit exceeded", 429);
    }

    if (response.error === 'not_found' || response.status === 404) {
      throw new CharityAPIError("Resource not found", 404);
    }

    // Log successful health check
    logger.debug("Response health check passed", { endpoint });
  }
}
