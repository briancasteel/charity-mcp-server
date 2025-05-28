import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

export class CharityAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'CharityAPIError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function handleMCPError(error: unknown): McpError {
  if (error instanceof ValidationError) {
    return new McpError(
      ErrorCode.InvalidParams,
      `Invalid parameter${error.field ? ` '${error.field}'` : ''}: ${error.message}`
    );
  }
  
  if (error instanceof CharityAPIError) {
    if (error.statusCode === 404) {
      return new McpError(
        ErrorCode.InvalidParams,
        "Charity not found with provided EIN"
      );
    }
    
    if (error.statusCode === 429) {
      return new McpError(
        ErrorCode.InternalError,
        "Rate limit exceeded. Please try again later."
      );
    }
    
    return new McpError(
      ErrorCode.InternalError,
      `Charity API error: ${error.message}`
    );
  }
  
  // Generic error handling
  return new McpError(
    ErrorCode.InternalError,
    error instanceof Error ? error.message : "Unknown error occurred"
  );
}

export function setupErrorHandlers() {
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });
}
