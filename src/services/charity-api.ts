import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { logger } from '../utils/logger.js';
import { CharityAPIError } from '../utils/error-handler.js';

export interface CharityAPIConfig {
  baseURL: string;
  apiKey?: string;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
}

export interface CharityLookupResponse {
  data: {
    ein: string;
    name: string;
    city: string;
    state: string;
    country: string;
    deductibilityCode: string;
    deductibilityDetail: string;
    eligibilityEin: string;
    eligibilityName: string;
    eligibilityState: string;
    eligibilitySubsectionCode: string;
    eligibilitySubsectionDetail: string;
    eligibilityAffiliation: string;
    eligibilityClassification: string;
    eligibilityRuling: string;
    eligibilityDeductibility: string;
    eligibilityFoundation: string;
    eligibilityActivity: string;
    eligibilityOrganization: string;
    eligibilityStatus: string;
    eligibilityAdvancedRuling: string;
  };
}

export interface PublicCharityCheckResponse {
  data: {
    public_charity: boolean;
    ein: string;
  };
}

export interface CharitySearchResponse {
  data: Array<{
    ein: string;
    name: string;
    city: string;
    state: string;
    deductibilityCode: string;
  }>;
  pagination?: {
    page: number;
    totalPages: number;
    totalResults: number;
  };
}

export class CharityAPIClient {
  private client: AxiosInstance;
  private config: CharityAPIConfig;

  constructor(config: CharityAPIConfig) {
    this.config = config;
    this.client = this.createAxiosInstance();
  }

  private createAxiosInstance(): AxiosInstance {
    const client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'charity-mcp-server/1.0.0',
        ...(this.config.apiKey && { 'apikey': this.config.apiKey }),
      },
    });

    // Request interceptor for logging
    client.interceptors.request.use(
      (config) => {
        logger.debug('Making API request', {
          method: config.method,
          url: config.url,
          params: config.params,
        });
        return config;
      },
      (error) => {
        logger.error('Request interceptor error', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging and error handling
    client.interceptors.response.use(
      (response) => {
        logger.debug('API response received', {
          status: response.status,
          url: response.config.url,
        });
        return response;
      },
      (error: AxiosError) => {
        return this.handleAxiosError(error);
      }
    );

    return client;
  }

  private async handleAxiosError(error: AxiosError): Promise<never> {
    const status = error.response?.status;
    const statusText = error.response?.statusText;
    const url = error.config?.url;

    logger.error('API request failed', {
      status,
      statusText,
      url,
      message: error.message,
    });

    // Map specific HTTP status codes to meaningful errors
    switch (status) {
      case 400:
        throw new CharityAPIError('Invalid request parameters', status, error);
      case 401:
        throw new CharityAPIError('Invalid API key or unauthorized', status, error);
      case 403:
        throw new CharityAPIError('Access forbidden - check API permissions', status, error);
      case 404:
        throw new CharityAPIError('Charity not found', status, error);
      case 429:
        throw new CharityAPIError('Rate limit exceeded', status, error);
      case 500:
        throw new CharityAPIError('Internal server error', status, error);
      default:
        throw new CharityAPIError(
          `API request failed: ${error.message}`,
          status,
          error
        );
    }
  }

  async lookupCharity(ein: string): Promise<CharityLookupResponse> {
    try {
      const response = await this.retryRequest(() =>
        this.client.get(`/api/organizations/:${ein}`)
      );
      return response.data;
    } catch (error) {
      logger.error('Charity lookup failed', { ein, error });
      throw error;
    }
  }

  async checkPublicCharity(ein: string): Promise<PublicCharityCheckResponse> {
    try {
      const response = await this.retryRequest(() =>
        this.client.get(`/api/public_charity_check/${ein}`)
      );
      return response.data;
    } catch (error) {
      logger.error('Public charity check failed', { ein, error });
      throw error;
    }
  }

  async searchCharities(params: {
    q?: string;
    city?: string;
    state?: string;
    limit?: number;
    offset?: number;
  }): Promise<CharitySearchResponse> {
    try {
      const response = await this.retryRequest(() =>
        //this.client.get('/api/charity_search', { params })
        this.client.get('/api/organizations/search/', { params })
      );
      return response.data;
    } catch (error) {
      logger.error('Charity search failed', { params, error });
      throw error;
    }
  }

  private async retryRequest<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    retryCount = 0
  ): Promise<AxiosResponse<T>> {
    try {
      return await requestFn();
    } catch (error) {
      const isRetryable = this.isRetryableError(error as AxiosError);
      const shouldRetry = retryCount < this.config.maxRetries && isRetryable;

      if (shouldRetry) {
        const delay = this.config.retryDelay * Math.pow(2, retryCount); // Exponential backoff
        logger.warn(`Retrying request in ${delay}ms (attempt ${retryCount + 1}/${this.config.maxRetries})`);
        
        await this.delay(delay);
        return this.retryRequest(requestFn, retryCount + 1);
      }

      throw error;
    }
  }

  private isRetryableError(error: AxiosError): boolean {
    if (!error.response) {
      // Network errors are generally retryable
      return true;
    }

    const status = error.response.status;
    // Retry on server errors and rate limits, but not client errors
    return status >= 500 || status === 429;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
