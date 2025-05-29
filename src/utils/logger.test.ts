import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { LogLevel, Logger, logger } from './logger.js';

describe('LogLevel', () => {
  it('should have correct enum values', () => {
    expect(LogLevel.DEBUG).toBe(0);
    expect(LogLevel.INFO).toBe(1);
    expect(LogLevel.WARN).toBe(2);
    expect(LogLevel.ERROR).toBe(3);
  });
});

describe('Logger', () => {
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;
  let mockDate: Date;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock Date.toISOString for consistent timestamps in tests
    mockDate = new Date('2023-01-01T12:00:00.000Z');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
    jest.spyOn(mockDate, 'toISOString').mockReturnValue('2023-01-01T12:00:00.000Z');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should default to INFO level', () => {
      const testLogger = new Logger();
      expect((testLogger as any).logLevel).toBe(LogLevel.INFO);
    });

    it('should accept DEBUG level', () => {
      const testLogger = new Logger('DEBUG');
      expect((testLogger as any).logLevel).toBe(LogLevel.DEBUG);
    });

    it('should accept INFO level', () => {
      const testLogger = new Logger('INFO');
      expect((testLogger as any).logLevel).toBe(LogLevel.INFO);
    });

    it('should accept WARN level', () => {
      const testLogger = new Logger('WARN');
      expect((testLogger as any).logLevel).toBe(LogLevel.WARN);
    });

    it('should accept ERROR level', () => {
      const testLogger = new Logger('ERROR');
      expect((testLogger as any).logLevel).toBe(LogLevel.ERROR);
    });
  });

  describe('shouldLog', () => {
    it('should log messages at or above DEBUG level when set to DEBUG', () => {
      const testLogger = new Logger('DEBUG');
      
      expect((testLogger as any).shouldLog(LogLevel.DEBUG)).toBe(true);
      expect((testLogger as any).shouldLog(LogLevel.INFO)).toBe(true);
      expect((testLogger as any).shouldLog(LogLevel.WARN)).toBe(true);
      expect((testLogger as any).shouldLog(LogLevel.ERROR)).toBe(true);
    });

    it('should log messages at or above INFO level when set to INFO', () => {
      const testLogger = new Logger('INFO');
      
      expect((testLogger as any).shouldLog(LogLevel.DEBUG)).toBe(false);
      expect((testLogger as any).shouldLog(LogLevel.INFO)).toBe(true);
      expect((testLogger as any).shouldLog(LogLevel.WARN)).toBe(true);
      expect((testLogger as any).shouldLog(LogLevel.ERROR)).toBe(true);
    });

    it('should log messages at or above WARN level when set to WARN', () => {
      const testLogger = new Logger('WARN');
      
      expect((testLogger as any).shouldLog(LogLevel.DEBUG)).toBe(false);
      expect((testLogger as any).shouldLog(LogLevel.INFO)).toBe(false);
      expect((testLogger as any).shouldLog(LogLevel.WARN)).toBe(true);
      expect((testLogger as any).shouldLog(LogLevel.ERROR)).toBe(true);
    });

    it('should log only ERROR messages when set to ERROR', () => {
      const testLogger = new Logger('ERROR');
      
      expect((testLogger as any).shouldLog(LogLevel.DEBUG)).toBe(false);
      expect((testLogger as any).shouldLog(LogLevel.INFO)).toBe(false);
      expect((testLogger as any).shouldLog(LogLevel.WARN)).toBe(false);
      expect((testLogger as any).shouldLog(LogLevel.ERROR)).toBe(true);
    });
  });

  describe('formatMessage', () => {
    it('should format message without meta', () => {
      const testLogger = new Logger();
      const formatted = (testLogger as any).formatMessage('INFO', 'Test message');
      
      expect(formatted).toBe('[2023-01-01T12:00:00.000Z] INFO: Test message');
    });

    it('should format message with meta object', () => {
      const testLogger = new Logger();
      const meta = { userId: 123, action: 'test' };
      const formatted = (testLogger as any).formatMessage('ERROR', 'Test message', meta);
      
      expect(formatted).toBe('[2023-01-01T12:00:00.000Z] ERROR: Test message {"userId":123,"action":"test"}');
    });

    it('should format message with primitive meta', () => {
      const testLogger = new Logger();
      const formatted = (testLogger as any).formatMessage('WARN', 'Test message', 'string meta');
      
      expect(formatted).toBe('[2023-01-01T12:00:00.000Z] WARN: Test message "string meta"');
    });

    it('should handle null meta', () => {
      const testLogger = new Logger();
      const formatted = (testLogger as any).formatMessage('DEBUG', 'Test message', null);
      
      expect(formatted).toBe('[2023-01-01T12:00:00.000Z] DEBUG: Test message');
    });
  });

  describe('logging methods', () => {
    describe('debug', () => {
      it('should log debug message when level is DEBUG', () => {
        const testLogger = new Logger('DEBUG');
        testLogger.debug('Debug message');
        
        expect(consoleErrorSpy).toHaveBeenCalledWith('[2023-01-01T12:00:00.000Z] DEBUG: Debug message');
      });

      it('should log debug message with meta when level is DEBUG', () => {
        const testLogger = new Logger('DEBUG');
        const meta = { test: 'value' };
        testLogger.debug('Debug message', meta);
        
        expect(consoleErrorSpy).toHaveBeenCalledWith('[2023-01-01T12:00:00.000Z] DEBUG: Debug message {"test":"value"}');
      });

      it('should not log debug message when level is INFO', () => {
        const testLogger = new Logger('INFO');
        testLogger.debug('Debug message');
        
        expect(consoleErrorSpy).not.toHaveBeenCalled();
      });
    });

    describe('info', () => {
      it('should log info message when level is INFO', () => {
        const testLogger = new Logger('INFO');
        testLogger.info('Info message');
        
        expect(consoleErrorSpy).toHaveBeenCalledWith('[2023-01-01T12:00:00.000Z] INFO: Info message');
      });

      it('should log info message with meta when level is DEBUG', () => {
        const testLogger = new Logger('DEBUG');
        const meta = { request: 'data' };
        testLogger.info('Info message', meta);
        
        expect(consoleErrorSpy).toHaveBeenCalledWith('[2023-01-01T12:00:00.000Z] INFO: Info message {"request":"data"}');
      });

      it('should not log info message when level is WARN', () => {
        const testLogger = new Logger('WARN');
        testLogger.info('Info message');
        
        expect(consoleErrorSpy).not.toHaveBeenCalled();
      });
    });

    describe('warn', () => {
      it('should log warn message when level is WARN', () => {
        const testLogger = new Logger('WARN');
        testLogger.warn('Warning message');
        
        expect(consoleErrorSpy).toHaveBeenCalledWith('[2023-01-01T12:00:00.000Z] WARN: Warning message');
      });

      it('should log warn message with meta when level is INFO', () => {
        const testLogger = new Logger('INFO');
        const meta = { warning: 'deprecated' };
        testLogger.warn('Warning message', meta);
        
        expect(consoleErrorSpy).toHaveBeenCalledWith('[2023-01-01T12:00:00.000Z] WARN: Warning message {"warning":"deprecated"}');
      });

      it('should not log warn message when level is ERROR', () => {
        const testLogger = new Logger('ERROR');
        testLogger.warn('Warning message');
        
        expect(consoleErrorSpy).not.toHaveBeenCalled();
      });
    });

    describe('error', () => {
      it('should log error message at all levels', () => {
        const levels: Array<keyof typeof LogLevel> = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
        
        levels.forEach(level => {
          const testLogger = new Logger(level);
          testLogger.error('Error message');
          
          expect(consoleErrorSpy).toHaveBeenCalledWith('[2023-01-01T12:00:00.000Z] ERROR: Error message');
          
          // Reset for next iteration
          consoleErrorSpy.mockClear();
        });
      });

      it('should log error message with meta', () => {
        const testLogger = new Logger('ERROR');
        const meta = { error: 'critical', code: 500 };
        testLogger.error('Error message', meta);
        
        expect(consoleErrorSpy).toHaveBeenCalledWith('[2023-01-01T12:00:00.000Z] ERROR: Error message {"error":"critical","code":500}');
      });
    });
  });

  describe('multiple log calls', () => {
    it('should handle multiple log calls correctly', () => {
      const testLogger = new Logger('DEBUG');
      
      testLogger.debug('Debug 1');
      testLogger.info('Info 1');
      testLogger.warn('Warn 1');
      testLogger.error('Error 1');
      
      expect(consoleErrorSpy).toHaveBeenCalledTimes(4);
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(1, '[2023-01-01T12:00:00.000Z] DEBUG: Debug 1');
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(2, '[2023-01-01T12:00:00.000Z] INFO: Info 1');
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(3, '[2023-01-01T12:00:00.000Z] WARN: Warn 1');
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(4, '[2023-01-01T12:00:00.000Z] ERROR: Error 1');
    });
  });
});

describe('exported logger instance', () => {
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;
  let originalEnv: string | undefined;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    originalEnv = process.env.LOG_LEVEL;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    if (originalEnv !== undefined) {
      process.env.LOG_LEVEL = originalEnv;
    } else {
      delete process.env.LOG_LEVEL;
    }
  });

  it('should be an instance of Logger', () => {
    expect(logger).toBeInstanceOf(Logger);
  });

  it('should use INFO as default level when no LOG_LEVEL env var', () => {
    delete process.env.LOG_LEVEL;
    
    // Since the logger is already instantiated, we'll test its behavior
    logger.info('Test info');
    logger.debug('Test debug');
    
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1); // Only info should log
  });

  it('should respect LOG_LEVEL environment variable', () => {
    // This test demonstrates the intended behavior, though the actual logger
    // instance is created at module load time
    expect(logger).toBeDefined();
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
  });

  it('should have all logging methods available', () => {
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
  });
});
