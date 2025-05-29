import { describe, it, expect, jest } from '@jest/globals';
import { ResponseValidator } from './response-validator.js';
import { CharityAPIError } from '../utils/error-handler.js';

// Mock the logger
jest.mock('../utils/logger.js', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }
}));

describe('ResponseValidator', () => {
  describe('validateCharityLookupResponse', () => {
    describe('valid responses', () => {
      it('should validate complete charity lookup response', () => {
        const response = {
          data: {
            ein: '12-3456789',
            name: 'Test Charity',
            city: 'San Francisco',
            state: 'CA',
            country: 'US',
            deductibilityCode: '1',
            deductibilityDetail: 'Contributions are deductible',
            eligibilityEin: '12-3456789',
            eligibilityName: 'Test Charity',
            eligibilityState: 'CA',
            eligibilitySubsectionCode: '03',
            eligibilitySubsectionDetail: '501(c)(3)',
            eligibilityAffiliation: 'Independent',
            eligibilityClassification: 'Religious',
            eligibilityRuling: '1995',
            eligibilityDeductibility: 'Yes',
            eligibilityFoundation: 'No',
            eligibilityActivity: 'Education',
            eligibilityOrganization: 'Corporation',
            eligibilityStatus: 'Active',
            eligibilityAdvancedRuling: 'No',
          }
        };

        const result = ResponseValidator.validateCharityLookupResponse(response);
        expect(result).toEqual(response);
      });

      it('should validate minimal charity lookup response', () => {
        const response = {
          data: {
            ein: '12-3456789',
            name: 'Test Charity',
          }
        };

        const result = ResponseValidator.validateCharityLookupResponse(response);
        expect(result).toEqual(response);
      });

      it('should validate response with only name', () => {
        const response = {
          data: {
            name: 'Test Charity',
          }
        };

        const result = ResponseValidator.validateCharityLookupResponse(response);
        expect(result).toEqual(response);
      });
    });

    describe('error responses', () => {
      it('should throw CharityAPIError for API error response', () => {
        const response = {
          error: 'Invalid EIN provided',
          message: 'The provided EIN is not valid'
        };

        expect(() => ResponseValidator.validateCharityLookupResponse(response))
          .toThrow(CharityAPIError);
        expect(() => ResponseValidator.validateCharityLookupResponse(response))
          .toThrow('API Error: Invalid EIN provided');
      });

      it('should throw CharityAPIError for missing data', () => {
        const response = {
          message: 'Success but no data'
        };

        expect(() => ResponseValidator.validateCharityLookupResponse(response))
          .toThrow(CharityAPIError);
        expect(() => ResponseValidator.validateCharityLookupResponse(response))
          .toThrow('No data returned from API');
      });

      it('should throw CharityAPIError for data without EIN or name', () => {
        const response = {
          data: {
            city: 'San Francisco',
            state: 'CA'
          }
        };

        expect(() => ResponseValidator.validateCharityLookupResponse(response))
          .toThrow(CharityAPIError);
        expect(() => ResponseValidator.validateCharityLookupResponse(response))
          .toThrow('missing both EIN and name');
      });

      it('should throw CharityAPIError for invalid schema', () => {
        const response = {
          data: {
            ein: 123456789, // should be string
            name: 'Test Charity'
          }
        };

        expect(() => ResponseValidator.validateCharityLookupResponse(response))
          .toThrow(CharityAPIError);
        expect(() => ResponseValidator.validateCharityLookupResponse(response))
          .toThrow('Invalid response format from CharityAPI');
      });
    });
  });

  describe('validatePublicCharityCheckResponse', () => {
    describe('valid responses', () => {
      it('should validate public charity response', () => {
        const response = {
          data: {
            public_charity: true,
            ein: '12-3456789'
          }
        };

        const result = ResponseValidator.validatePublicCharityCheckResponse(response);
        expect(result).toEqual(response);
      });

      it('should validate non-public charity response', () => {
        const response = {
          data: {
            public_charity: false,
            ein: '12-3456789'
          }
        };

        const result = ResponseValidator.validatePublicCharityCheckResponse(response);
        expect(result).toEqual(response);
      });
    });

    describe('error responses', () => {
      it('should throw CharityAPIError for API error response', () => {
        const response = {
          error: 'EIN not found',
          message: 'The provided EIN was not found in the database'
        };

        expect(() => ResponseValidator.validatePublicCharityCheckResponse(response))
          .toThrow(CharityAPIError);
        expect(() => ResponseValidator.validatePublicCharityCheckResponse(response))
          .toThrow('API Error: EIN not found');
      });

      it('should throw CharityAPIError for missing data', () => {
        const response = {
          message: 'Success but no data'
        };

        expect(() => ResponseValidator.validatePublicCharityCheckResponse(response))
          .toThrow(CharityAPIError);
        expect(() => ResponseValidator.validatePublicCharityCheckResponse(response))
          .toThrow('No data returned from API');
      });

      it('should throw CharityAPIError for missing public_charity field', () => {
        const response = {
          data: {
            ein: '12-3456789'
          }
        };

        expect(() => ResponseValidator.validatePublicCharityCheckResponse(response))
          .toThrow(CharityAPIError);
        expect(() => ResponseValidator.validatePublicCharityCheckResponse(response))
          .toThrow('public_charity status not provided');
      });

      it('should throw CharityAPIError for missing EIN', () => {
        const response = {
          data: {
            public_charity: true
          }
        };

        expect(() => ResponseValidator.validatePublicCharityCheckResponse(response))
          .toThrow(CharityAPIError);
        expect(() => ResponseValidator.validatePublicCharityCheckResponse(response))
          .toThrow('EIN not provided');
      });

      it('should throw CharityAPIError for invalid schema', () => {
        const response = {
          data: {
            public_charity: 'yes', // should be boolean
            ein: '12-3456789'
          }
        };

        expect(() => ResponseValidator.validatePublicCharityCheckResponse(response))
          .toThrow(CharityAPIError);
        expect(() => ResponseValidator.validatePublicCharityCheckResponse(response))
          .toThrow('Invalid response format from CharityAPI');
      });
    });
  });

  describe('validateCharitySearchResponse', () => {
    describe('valid responses', () => {
      it('should validate search response with results', () => {
        const response = {
          data: [
            {
              ein: '12-3456789',
              name: 'Test Charity 1',
              city: 'San Francisco',
              state: 'CA',
              deductibilityCode: '1'
            },
            {
              ein: '98-7654321',
              name: 'Test Charity 2',
              city: 'Los Angeles',
              state: 'CA'
            }
          ],
          pagination: {
            page: 1,
            totalPages: 5,
            totalResults: 100
          }
        };

        const result = ResponseValidator.validateCharitySearchResponse(response);
        expect(result).toEqual(response);
      });

      it('should validate empty search results', () => {
        const response = {
          data: [],
          pagination: {
            page: 1,
            totalPages: 0,
            totalResults: 0
          }
        };

        const result = ResponseValidator.validateCharitySearchResponse(response);
        expect(result).toEqual(response);
      });

      it('should handle missing data field', () => {
        const response = {
          pagination: {
            page: 1,
            totalPages: 0,
            totalResults: 0
          }
        };

        const result = ResponseValidator.validateCharitySearchResponse(response);
        expect(result.data).toEqual([]);
      });

      it('should validate minimal charity entries', () => {
        const response = {
          data: [
            {
              ein: '12-3456789',
              name: 'Test Charity'
            }
          ]
        };

        const result = ResponseValidator.validateCharitySearchResponse(response);
        expect(result).toEqual(response);
      });
    });

    describe('error responses', () => {
      it('should throw CharityAPIError for API error response', () => {
        const response = {
          error: 'Invalid search parameters',
          message: 'The provided search parameters are invalid'
        };

        expect(() => ResponseValidator.validateCharitySearchResponse(response))
          .toThrow(CharityAPIError);
        expect(() => ResponseValidator.validateCharitySearchResponse(response))
          .toThrow('API Error: Invalid search parameters');
      });

      it('should throw CharityAPIError for invalid schema', () => {
        const response = {
          data: [
            {
              ein: 123456789, // should be string
              name: 'Test Charity'
            }
          ]
        };

        expect(() => ResponseValidator.validateCharitySearchResponse(response))
          .toThrow(CharityAPIError);
        expect(() => ResponseValidator.validateCharitySearchResponse(response))
          .toThrow('Invalid response format from CharityAPI');
      });

      it('should handle entries with missing required fields gracefully', () => {
        const response = {
          data: [
            {
              ein: '12-3456789',
              name: 'Valid Charity'
            },
            {
              name: 'Missing EIN Charity' // missing EIN
            },
            {
              ein: '98-7654321' // missing name
            }
          ]
        };

        // Should not throw but should log warnings
        const result = ResponseValidator.validateCharitySearchResponse(response);
        expect(result.data).toHaveLength(3);
      });
    });
  });

  describe('validateResponseHealth', () => {
    describe('healthy responses', () => {
      it('should pass for valid object response', () => {
        const response = { data: { test: 'value' } };
        
        expect(() => ResponseValidator.validateResponseHealth(response, 'test-endpoint'))
          .not.toThrow();
      });

      it('should pass for empty object', () => {
        const response = {};
        
        expect(() => ResponseValidator.validateResponseHealth(response, 'test-endpoint'))
          .not.toThrow();
      });
    });

    describe('unhealthy responses', () => {
      it('should throw for null response', () => {
        expect(() => ResponseValidator.validateResponseHealth(null, 'test-endpoint'))
          .toThrow(CharityAPIError);
        expect(() => ResponseValidator.validateResponseHealth(null, 'test-endpoint'))
          .toThrow('No response received from test-endpoint');
      });

      it('should throw for undefined response', () => {
        expect(() => ResponseValidator.validateResponseHealth(undefined, 'test-endpoint'))
          .toThrow(CharityAPIError);
        expect(() => ResponseValidator.validateResponseHealth(undefined, 'test-endpoint'))
          .toThrow('No response received from test-endpoint');
      });

      it('should throw for non-object response', () => {
        expect(() => ResponseValidator.validateResponseHealth('string response', 'test-endpoint'))
          .toThrow(CharityAPIError);
        expect(() => ResponseValidator.validateResponseHealth('string response', 'test-endpoint'))
          .toThrow('Invalid response type from test-endpoint: expected object');

        expect(() => ResponseValidator.validateResponseHealth(123, 'test-endpoint'))
          .toThrow(CharityAPIError);
      });

      it('should throw for unauthorized error', () => {
        const response = { error: 'unauthorized' };
        
        expect(() => ResponseValidator.validateResponseHealth(response, 'test-endpoint'))
          .toThrow(CharityAPIError);
        expect(() => ResponseValidator.validateResponseHealth(response, 'test-endpoint'))
          .toThrow('API key is invalid or unauthorized');
      });

      it('should throw for 401 status', () => {
        const response = { status: 401 };
        
        expect(() => ResponseValidator.validateResponseHealth(response, 'test-endpoint'))
          .toThrow(CharityAPIError);
        expect(() => ResponseValidator.validateResponseHealth(response, 'test-endpoint'))
          .toThrow('API key is invalid or unauthorized');
      });

      it('should throw for rate limit error', () => {
        const response = { error: 'rate_limited' };
        
        expect(() => ResponseValidator.validateResponseHealth(response, 'test-endpoint'))
          .toThrow(CharityAPIError);
        expect(() => ResponseValidator.validateResponseHealth(response, 'test-endpoint'))
          .toThrow('Rate limit exceeded');
      });

      it('should throw for 429 status', () => {
        const response = { status: 429 };
        
        expect(() => ResponseValidator.validateResponseHealth(response, 'test-endpoint'))
          .toThrow(CharityAPIError);
        expect(() => ResponseValidator.validateResponseHealth(response, 'test-endpoint'))
          .toThrow('Rate limit exceeded');
      });

      it('should throw for not found error', () => {
        const response = { error: 'not_found' };
        
        expect(() => ResponseValidator.validateResponseHealth(response, 'test-endpoint'))
          .toThrow(CharityAPIError);
        expect(() => ResponseValidator.validateResponseHealth(response, 'test-endpoint'))
          .toThrow('Resource not found');
      });

      it('should throw for 404 status', () => {
        const response = { status: 404 };
        
        expect(() => ResponseValidator.validateResponseHealth(response, 'test-endpoint'))
          .toThrow(CharityAPIError);
        expect(() => ResponseValidator.validateResponseHealth(response, 'test-endpoint'))
          .toThrow('Resource not found');
      });
    });
  });
});
