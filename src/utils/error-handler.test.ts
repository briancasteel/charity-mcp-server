import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { CharityAPIError, ValidationError, handleMCPError, setupErrorHandlers } from './error-handler.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

describe('CharityAPIError', () => {
  it('should create error with message only', () => {
    const error = new CharityAPIError('Test error message');
    
    expect(error.name).toBe('CharityAPIError');
    expect(error.message).toBe('Test error message');
    expect(error.statusCode).toBeUndefined();
    expect(error.originalError).toBeUndefined();
    expect(error instanceof Error).toBe(true);
  });

  it('should create error with message and status code', () => {
    const error = new CharityAPIError('API error', 404);
    
    expect(error.name).toBe('CharityAPIError');
    expect(error.message).toBe('API error');
    expect(error.statusCode).toBe(404);
    expect(error.originalError).toBeUndefined();
  });

  it('should create error with message, status code, and original error', () => {
    const originalError = new Error('Original error');
    const error = new CharityAPIError('Wrapped error', 500, originalError);
    
    expect(error.name).toBe('CharityAPIError');
    expect(error.message).toBe('Wrapped error');
    expect(error.statusCode).toBe(500);
    expect(error.originalError).toBe(originalError);
  });

  it('should maintain error stack trace', () => {
    const error = new CharityAPIError('Test error');
    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('CharityAPIError');
  });
});

describe('ValidationError', () => {
  it('should create error with message only', () => {
    const error = new ValidationError('Validation failed');
    
    expect(error.name).toBe('ValidationError');
    expect(error.message).toBe('Validation failed');
    expect(error.field).toBeUndefined();
    expect(error instanceof Error).toBe(true);
  });

  it('should create error with message and field', () => {
    const error = new ValidationError('Field is required', 'ein');
    
    expect(error.name).toBe('ValidationError');
    expect(error.message).toBe('Field is required');
    expect(error.field).toBe('ein');
  });

  it('should maintain error stack trace', () => {
    const error = new ValidationError('Test validation error');
    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('ValidationError');
  });
});

describe('handleMCPError', () => {
  describe('ValidationError handling', () => {
    it('should convert ValidationError to InvalidParams McpError', () => {
      const validationError = new ValidationError('EIN is required');
      const mcpError = handleMCPError(validationError);
      
      expect(mcpError).toBeInstanceOf(McpError);
      expect(mcpError.code).toBe(ErrorCode.InvalidParams);
      expect(mcpError.message).toBe("Invalid parameter: EIN is required");
    });

    it('should include field name in ValidationError conversion', () => {
      const validationError = new ValidationError('Field is required', 'ein');
      const mcpError = handleMCPError(validationError);
      
      expect(mcpError).toBeInstanceOf(McpError);
      expect(mcpError.code).toBe(ErrorCode.InvalidParams);
      expect(mcpError.message).toBe("Invalid parameter 'ein': Field is required");
    });
  });

  describe('CharityAPIError handling', () => {
    it('should convert 404 CharityAPIError to InvalidParams McpError', () => {
      const apiError = new CharityAPIError('Charity not found', 404);
      const mcpError = handleMCPError(apiError);
      
      expect(mcpError).toBeInstanceOf(McpError);
      expect(mcpError.code).toBe(ErrorCode.InvalidParams);
      expect(mcpError.message).toBe("Charity not found with provided EIN");
    });

    it('should convert 429 CharityAPIError to InternalError McpError', () => {
      const apiError = new CharityAPIError('Too many requests', 429);
      const mcpError = handleMCPError(apiError);
      
      expect(mcpError).toBeInstanceOf(McpError);
      expect(mcpError.code).toBe(ErrorCode.InternalError);
      expect(mcpError.message).toBe("Rate limit exceeded. Please try again later.");
    });

    it('should convert other CharityAPIError to InternalError McpError', () => {
      const apiError = new CharityAPIError('API server error', 500);
      const mcpError = handleMCPError(apiError);
      
      expect(mcpError).toBeInstanceOf(McpError);
      expect(mcpError.code).toBe(ErrorCode.InternalError);
      expect(mcpError.message).toBe("Charity API error: API server error");
    });

    it('should handle CharityAPIError without status code', () => {
      const apiError = new CharityAPIError('Generic API error');
      const mcpError = handleMCPError(apiError);
      
      expect(mcpError).toBeInstanceOf(McpError);
      expect(mcpError.code).toBe(ErrorCode.InternalError);
      expect(mcpError.message).toBe("Charity API error: Generic API error");
    });
  });

  describe('generic error handling', () => {
    it('should convert generic Error to InternalError McpError', () => {
      const genericError = new Error('Something went wrong');
      const mcpError = handleMCPError(genericError);
      
      expect(mcpError).toBeInstanceOf(McpError);
      expect(mcpError.code).toBe(ErrorCode.InternalError);
      expect(mcpError.message).toBe("Something went wrong");
    });

    it('should handle string errors', () => {
      const mcpError = handleMCPError('String error message');
      
      expect(mcpError).toBeInstanceOf(McpError);
      expect(mcpError.code).toBe(ErrorCode.InternalError);
      expect(mcpError.message).toBe("Unknown error occurred");
    });

    it('should handle null errors', () => {
      const mcpError = handleMCPError(null);
      
      expect(mcpError).toBeInstanceOf(McpError);
      expect(mcpError.code).toBe(ErrorCode.InternalError);
      expect(mcpError.message).toBe("Unknown error occurred");
    });

    it('should handle undefined errors', () => {
      const mcpError = handleMCPError(undefined);
      
      expect(mcpError).toBeInstanceOf(McpError);
      expect(mcpError.code).toBe(ErrorCode.InternalError);
      expect(mcpError.message).toBe("Unknown error occurred");
    });

    it('should handle object errors', () => {
      const mcpError = handleMCPError({ message: 'Object error' });
      
      expect(mcpError).toBeInstanceOf(McpError);
      expect(mcpError.code).toBe(ErrorCode.InternalError);
      expect(mcpError.message).toBe("Unknown error occurred");
    });
  });
});

describe('setupErrorHandlers', () => {
  let originalConsoleError: typeof console.error;
  let originalProcessExit: typeof process.exit;
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;
  let processExitSpy: jest.SpiedFunction<typeof process.exit>;
  let processOnSpy: jest.SpiedFunction<typeof process.on>;

  beforeEach(() => {
    // Save original functions
    originalConsoleError = console.error;
    originalProcessExit = process.exit;

    // Create spies
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit() was called');
    });
    processOnSpy = jest.spyOn(process, 'on').mockImplementation(() => process);
  });

  afterEach(() => {
    // Restore original functions
    console.error = originalConsoleError;
    process.exit = originalProcessExit;
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  it('should set up uncaughtException handler', () => {
    setupErrorHandlers();
    
    expect(processOnSpy).toHaveBeenCalledWith('uncaughtException', expect.any(Function));
  });

  it('should set up unhandledRejection handler', () => {
    setupErrorHandlers();
    
    expect(processOnSpy).toHaveBeenCalledWith('unhandledRejection', expect.any(Function));
  });

  it('should handle uncaughtException correctly', () => {
    setupErrorHandlers();
    
    // Get the uncaughtException handler
    const uncaughtExceptionCall = processOnSpy.mock.calls.find(call => call[0] === 'uncaughtException');
    expect(uncaughtExceptionCall).toBeDefined();
    
    const handler = uncaughtExceptionCall![1] as (error: Error) => void;
    const testError = new Error('Test uncaught exception');
    
    expect(() => handler(testError)).toThrow('process.exit() was called');
    expect(consoleErrorSpy).toHaveBeenCalledWith('Uncaught Exception:', testError);
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it('should handle unhandledRejection correctly', () => {
    setupErrorHandlers();
    
    // Get the unhandledRejection handler
    const unhandledRejectionCall = processOnSpy.mock.calls.find(call => call[0] === 'unhandledRejection');
    expect(unhandledRejectionCall).toBeDefined();
    
    const handler = unhandledRejectionCall![1] as (reason: any, promise: Promise<any>) => void;
    const testReason = 'Test rejection reason';
    const testPromise = Promise.reject(testReason);
    
    handler(testReason, testPromise);
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('Unhandled Rejection at:', testPromise, 'reason:', testReason);
    expect(processExitSpy).not.toHaveBeenCalled(); // unhandledRejection doesn't exit
  });

  it('should register both handlers when called', () => {
    setupErrorHandlers();
    
    expect(processOnSpy).toHaveBeenCalledTimes(2);
    expect(processOnSpy).toHaveBeenCalledWith('uncaughtException', expect.any(Function));
    expect(processOnSpy).toHaveBeenCalledWith('unhandledRejection', expect.any(Function));
  });
});
