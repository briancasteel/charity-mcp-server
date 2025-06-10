import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { handleListOrganizations, LIST_ORGANIZATIONS_TOOL } from './list-organizations.js';
import { CharityAPIError } from '../utils/error-handler.js';
import { ListOrganizationsResponse } from '../services/charity-api.js';

// Mock dependencies
jest.mock('../index.js', () => ({
  charityAPIClient: {
    listOrganizations: jest.fn(),
  },
  rateLimiter: {
    checkRateLimit: jest.fn(),
    getResetTime: jest.fn(),
  },
}));

jest.mock('../utils/logger.js', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }
}));

// Import mocked modules
import { charityAPIClient, rateLimiter } from '../index.js';

const mockCharityAPIClient = charityAPIClient as jest.Mocked<typeof charityAPIClient>;
const mockRateLimiter = rateLimiter as jest.Mocked<typeof rateLimiter>;

describe('List Organizations Tool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRateLimiter.checkRateLimit.mockResolvedValue(true);
  });

  describe('LIST_ORGANIZATIONS_TOOL definition', () => {
    it('should have correct tool definition', () => {
      expect(LIST_ORGANIZATIONS_TOOL.name).toBe('List Organizations');
      expect(LIST_ORGANIZATIONS_TOOL.description).toContain('List nonprofit organizations');
      expect(LIST_ORGANIZATIONS_TOOL.inputSchema.required).toContain('since');
      expect(LIST_ORGANIZATIONS_TOOL.inputSchema.properties.since).toBeDefined();
    });
  });

  describe('handleListOrganizations', () => {
    describe('valid requests', () => {
      it('should handle successful list organizations request', async () => {
        const mockResponse: ListOrganizationsResponse = {
          data: [
            {
              ein: '12-3456789',
              name: 'Test Charity 1',
              city: 'San Francisco',
              state: 'CA',
              zip: '94102',
              street: '123 Main St',
              status: '01',
              classification: '3000',
              subsection: '03',
              foundation: '15',
              activity: 'Education',
              organization: '1',
              deductibility: '1',
              ruling: '199501',
              tax_period: '202312',
              revenue_amt: '1000000',
              income_amt: '950000',
              asset_amt: '2000000',
              sort_name: 'Test Charity 1',
              pf_filing_req_cd: '0',
              ntee_cd: 'B25',
              income_cd: '6',
              ico: '',
              group: '0000',
              filing_req_cd: '01',
              asset_cd: '7',
              affiliation: '3',
              acct_pd: '12',
            },
            {
              ein: '98-7654321',
              name: 'Test Charity 2',
              city: 'Los Angeles',
              state: 'CA',
              zip: '90210',
              street: '456 Oak Ave',
              status: '01',
              classification: '3000',
              subsection: '03',
              foundation: '15',
              activity: 'Health',
              organization: '1',
              deductibility: '1',
              ruling: '200001',
              tax_period: '202312',
              revenue_amt: '500000',
              income_amt: '475000',
              asset_amt: '1000000',
              sort_name: 'Test Charity 2',
              pf_filing_req_cd: '0',
              ntee_cd: 'E20',
              income_cd: '5',
              ico: '',
              group: '0000',
              filing_req_cd: '01',
              asset_cd: '6',
              affiliation: '3',
              acct_pd: '12',
            }
          ]
        };

        mockCharityAPIClient.listOrganizations.mockResolvedValue(mockResponse);

        const args = {
          since: '2024-01-01T00:00:00Z',
        };

        const result = await handleListOrganizations(args);

        expect(result.isError).toBeUndefined();
        expect(result.content).toHaveLength(1);
        expect(result.content[0].type).toBe('text');
        expect(result.content[0].text).toContain('Organizations List');
        expect(result.content[0].text).toContain('Test Charity 1');
        expect(result.content[0].text).toContain('Test Charity 2');
        expect(result.content[0].text).toContain('12-3456789');
        expect(result.content[0].text).toContain('98-7654321');
      });

      it('should handle empty results', async () => {
        const mockResponse: ListOrganizationsResponse = {
          data: []
        };

        mockCharityAPIClient.listOrganizations.mockResolvedValue(mockResponse);

        const args = {
          since: '2024-01-01T00:00:00Z',
        };

        const result = await handleListOrganizations(args);

        expect(result.isError).toBeUndefined();
        expect(result.content[0].text).toContain('No organizations found');
      });

      it('should handle large result sets correctly', async () => {
        const mockResponse: ListOrganizationsResponse = {
          data: Array.from({ length: 150 }, (_, i) => ({
            ein: `${String(i + 1).padStart(2, '0')}-${String(i + 1000000).padStart(7, '0')}`,
            name: `Test Charity ${i + 1}`,
            city: 'Test City',
            state: 'CA',
            zip: '12345',
            tax_period: '202312',
            subsection: '03',
            street: 'Test Street',
            status: '01',
            sort_name: `Test Charity ${i + 1}`,
            ruling: '200001',
            revenue_amt: '100000',
            pf_filing_req_cd: '0',
            organization: '1',
            ntee_cd: 'B25',
            income_cd: '4',
            income_amt: '95000',
            ico: '',
            group: '0000',
            foundation: '15',
            filing_req_cd: '01',
            deductibility: '1',
            classification: '3000',
            asset_cd: '4',
            asset_amt: '200000',
            affiliation: '3',
            activity: 'Education',
            acct_pd: '12',
          }))
        };

        mockCharityAPIClient.listOrganizations.mockResolvedValue(mockResponse);

        const args = {
          since: '2024-01-01T00:00:00Z',
        };

        const result = await handleListOrganizations(args);

        expect(result.isError).toBeUndefined();
        expect(result.content[0].text).toContain('150 organizations found');
        expect(result.content[0].text).not.toContain('More Results Available');
      });
    });

    describe('input validation', () => {
      it('should reject invalid date format', async () => {
        const args = {
          since: 'invalid-date',
        };

        const result = await handleListOrganizations(args);

        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain('Since must be a valid ISO date string');
      });

    });

    describe('rate limiting', () => {
      it('should handle rate limit exceeded', async () => {
        mockRateLimiter.checkRateLimit.mockResolvedValue(false);
        mockRateLimiter.getResetTime.mockReturnValue(Date.now() + 60000);

        const args = {
          since: '2024-01-01T00:00:00Z',
        };

        const result = await handleListOrganizations(args);

        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain('Rate limit exceeded');
      });
    });

    describe('error handling', () => {
      it('should handle API errors', async () => {
        mockCharityAPIClient.listOrganizations.mockRejectedValue(
          new CharityAPIError('API Error', 500)
        );

        const args = {
          since: '2024-01-01T00:00:00Z',
        };

        const result = await handleListOrganizations(args);

        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain('API Error');
      });

      it('should handle missing data response', async () => {
        mockCharityAPIClient.listOrganizations.mockResolvedValue({
          data: null as any
        });

        const args = {
          since: '2024-01-01T00:00:00Z',
        };

        const result = await handleListOrganizations(args);

        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain('Charity not found');
      });
    });
  });
});
