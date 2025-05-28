import { logger } from "../utils/logger.js";
import { CharityAPIError, ValidationError } from "../utils/error-handler.js";

export interface FormattedError {
  message: string;
  code: string;
  details?: string;
  suggestions?: string[];
}

export class ErrorFormatter {
  /**
   * Format validation errors for user-friendly display
   */
  static formatValidationError(error: ValidationError): FormattedError {
    logger.debug("Formatting validation error", { error: error.message, field: error.field });

    const suggestions: string[] = [];
    let details = '';

    if (error.field === 'ein') {
      suggestions.push('Use format XX-XXXXXXX (e.g., 13-1837418)');
      suggestions.push('Ensure the EIN contains exactly 9 digits');
      suggestions.push('Verify the EIN from official charity documents');
      details = 'EIN (Employer Identification Number) must be a valid 9-digit tax ID';
    } else if (error.field === 'query') {
      suggestions.push('Use simpler search terms');
      suggestions.push('Avoid special characters and HTML');
      suggestions.push('Try searching by organization name');
      details = 'Search queries should contain only standard text characters';
    } else if (error.field === 'state') {
      suggestions.push('Use 2-letter state abbreviations (CA, NY, TX, etc.)');
      suggestions.push('Use uppercase letters');
      details = 'State must be a valid US state or territory abbreviation';
    } else if (error.field === 'city') {
      suggestions.push('Check spelling of city name');
      suggestions.push('Use standard city names');
      details = 'City names should contain mostly alphabetic characters';
    } else if (error.field === 'limit') {
      suggestions.push('Use a number between 1 and 100');
      details = 'Limit controls how many results are returned per request';
    } else if (error.field === 'offset') {
      suggestions.push('Use a non-negative number');
      suggestions.push('Start with 0 for the first page');
      details = 'Offset controls which page of results to return';
    }

    return {
      message: `Input validation failed: ${error.message}`,
      code: 'VALIDATION_ERROR',
      details,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    };
  }

  /**
   * Format API errors for user-friendly display
   */
  static formatAPIError(error: CharityAPIError): FormattedError {
    logger.debug("Formatting API error", { 
      message: error.message, 
      statusCode: error.statusCode 
    });

    const suggestions: string[] = [];
    let code = 'API_ERROR';
    let details = '';

    switch (error.statusCode) {
      case 400:
        code = 'INVALID_REQUEST';
        details = 'The request was invalid or malformed';
        suggestions.push('Check that all parameters are correct');
        suggestions.push('Verify EIN format if applicable');
        break;

      case 401:
        code = 'UNAUTHORIZED';
        details = 'API authentication failed';
        suggestions.push('Check that your API key is correct');
        suggestions.push('Verify API key permissions');
        break;

      case 403:
        code = 'FORBIDDEN';
        details = 'Access to this resource is forbidden';
        suggestions.push('Check API key permissions');
        suggestions.push('Contact support if you believe this is an error');
        break;

      case 404:
        code = 'NOT_FOUND';
        details = 'No charity found matching the provided criteria';
        suggestions.push('Verify the EIN is correct');
        suggestions.push('Try searching by name if EIN lookup fails');
        suggestions.push('Check that the organization is registered with the IRS');
        break;

      case 429:
        code = 'RATE_LIMITED';
        details = 'Too many requests sent in a short time';
        suggestions.push('Wait a moment before trying again');
        suggestions.push('Reduce the frequency of requests');
        break;

      case 500:
      case 502:
      case 503:
        code = 'SERVER_ERROR';
        details = 'The CharityAPI service is experiencing issues';
        suggestions.push('Try again in a few minutes');
        suggestions.push('Contact support if the problem persists');
        break;

      default:
        details = 'An unexpected error occurred while calling the CharityAPI';
        suggestions.push('Try again in a moment');
        break;
    }

    return {
      message: error.message,
      code,
      details,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    };
  }

  /**
   * Format generic errors for user-friendly display
   */
  static formatGenericError(error: Error): FormattedError {
    logger.debug("Formatting generic error", { 
      name: error.name, 
      message: error.message 
    });

    return {
      message: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
      details: 'The server encountered an internal error while processing your request',
      suggestions: [
        'Try again in a moment',
        'Contact support if the problem persists',
      ],
    };
  }

  /**
   * Convert formatted error to user-friendly text
   */
  static toUserMessage(formattedError: FormattedError): string {
    let message = `❌ ${formattedError.message}\n`;
    
    if (formattedError.details) {
      message += `\n**Details:** ${formattedError.details}\n`;
    }

    if (formattedError.suggestions && formattedError.suggestions.length > 0) {
      message += `\n**Suggestions:**\n`;
      formattedError.suggestions.forEach(suggestion => {
        message += `• ${suggestion}\n`;
      });
    }

    return message.trim();
  }
}
