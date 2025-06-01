import { CallToolResult, TextContent } from "@modelcontextprotocol/sdk/types.js";
import { charityAPIClient, rateLimiter } from "../index.js";
import { CharityLookupInputSchema } from "../schemas/charity-schemas.js";
import { logger } from "../utils/logger.js";
import { handleMCPError, ValidationError } from "../utils/error-handler.js";
import { EINValidator } from "../validation/input-validator.js";
import { InputSanitizer } from "../validation/input-sanitizer.js";
import { ResponseValidator } from "../validation/response-validator.js";
import { CharityTransformer } from "../transformers/charity-transformer.js";
import { ResponseFormatter } from "../formatting/response-formatter.js";
import { ErrorFormatter } from "../formatting/error-formatter.js";

export const CHARITY_LOOKUP_TOOL = {
  name: "charity_lookup",
  description: `
    Look up detailed information about a charity or nonprofit organization using their EIN (Employer Identification Number).
    This tool retrieves comprehensive information from the IRS database including:
    - Official organization name and location
    - Tax deductibility status and codes
    - Organization classification and activity codes
    - Current status with the IRS
    - Foundation type and ruling information
    
    Use this tool when you need complete details about a specific charity.
  `.trim(),
  inputSchema: {
    type: "object" as const,
    properties: {
      ein: {
        type: "string",
        description: "The charity's EIN (Tax ID) in format XX-XXXXXXX or XXXXXXXXX (e.g., '13-1837418' or '131837418')",
        pattern: "^\\d{2}-?\\d{7}$",
      },
    },
    required: ["ein"],
  },
};

export async function handleCharityLookup(args: unknown): Promise<CallToolResult> {
  const startTime = Date.now();
  
  try {
    logger.debug("Charity lookup requested", { args });

    // Extract and sanitize input
    const rawInput = args as any;
    const sanitizedEIN = InputSanitizer.sanitizeEIN(rawInput?.ein || '');
    
    if (!sanitizedEIN) {
      throw new ValidationError("EIN is required", "ein");
    }

    // Validate EIN format and business rules
    const validatedEIN = EINValidator.validate(sanitizedEIN);
    
    logger.debug("Input validated", { originalEIN: rawInput?.ein, validatedEIN });

    // Check rate limit
    if (!(await rateLimiter.checkRateLimit('charity_lookup'))) {
      const resetTime = rateLimiter.getResetTime('charity_lookup');
      const resetDate = new Date(resetTime).toISOString();
      
      return {
        content: [
          {
            type: "text",
            text: `⏱️ Rate limit exceeded for charity lookup. Please try again after ${resetDate}.`,
          } as TextContent,
        ],
        isError: true,
      };
    }

    // Make API call
    logger.info("Looking up charity", { ein: validatedEIN });
    const apiResponse = await charityAPIClient.getOrganizationByEIN(validatedEIN);
    
    // Validate API response
    const validatedResponse = ResponseValidator.validateGetOrgResponse(apiResponse);
    
    // Transform to standardized format
    const transformedCharity = CharityTransformer.transformCharityLookup(validatedResponse, validatedEIN);
    
    // Format for display
    const formattedText = ResponseFormatter.formatCharityLookup(transformedCharity);
    
    const processingTime = Date.now() - startTime;
    logger.info("Charity lookup completed successfully", { 
      ein: validatedEIN, 
      name: transformedCharity.name,
      processingTime 
    });

    return {
      content: [
        {
          type: "text",
          text: formattedText,
        } as TextContent,
      ],
    };

  } catch (error) {
    const processingTime = Date.now() - startTime;
    logger.error("Charity lookup failed", { args, error, processingTime });
    
    let formattedError;
    let errorText: string;

    if (error instanceof ValidationError) {
      formattedError = ErrorFormatter.formatValidationError(error);
      errorText = ErrorFormatter.toUserMessage(formattedError);
    } else {
      const mcpError = handleMCPError(error);
      errorText = mcpError.message;
    }

    return {
      content: [
        {
          type: "text",
          text: errorText,
        } as TextContent,
      ],
      isError: true,
    };
  }
}
