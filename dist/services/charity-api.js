import axios from 'axios';
import { logger } from '../utils/logger.js';
import { CharityAPIError } from '../utils/error-handler.js';
export class CharityAPIClient {
    client;
    config;
    constructor(config) {
        this.config = config;
        this.client = this.createAxiosInstance();
    }
    createAxiosInstance() {
        const client = axios.create({
            baseURL: this.config.baseURL,
            timeout: this.config.timeout,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'charity-mcp-server/1.0.0',
                ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
            },
        });
        // Request interceptor for logging
        client.interceptors.request.use((config) => {
            logger.debug('Making API request', {
                method: config.method,
                url: config.url,
                params: config.params,
            });
            return config;
        }, (error) => {
            logger.error('Request interceptor error', error);
            return Promise.reject(error);
        });
        // Response interceptor for logging and error handling
        client.interceptors.response.use((response) => {
            logger.debug('API response received', {
                status: response.status,
                url: response.config.url,
            });
            return response;
        }, (error) => {
            return this.handleAxiosError(error);
        });
        return client;
    }
    async handleAxiosError(error) {
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
                throw new CharityAPIError(`API request failed: ${error.message}`, status, error);
        }
    }
    async lookupCharity(ein) {
        try {
            const response = await this.retryRequest(() => this.client.get(`/api/charity_lookup/${ein}`));
            return response.data;
        }
        catch (error) {
            logger.error('Charity lookup failed', { ein, error });
            throw error;
        }
    }
    async checkPublicCharity(ein) {
        try {
            const response = await this.retryRequest(() => this.client.get(`/api/public_charity_check/${ein}`));
            return response.data;
        }
        catch (error) {
            logger.error('Public charity check failed', { ein, error });
            throw error;
        }
    }
    async searchCharities(params) {
        try {
            const response = await this.retryRequest(() => this.client.get('/api/charity_search', { params }));
            return response.data;
        }
        catch (error) {
            logger.error('Charity search failed', { params, error });
            throw error;
        }
    }
    async retryRequest(requestFn, retryCount = 0) {
        try {
            return await requestFn();
        }
        catch (error) {
            const isRetryable = this.isRetryableError(error);
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
    isRetryableError(error) {
        if (!error.response) {
            // Network errors are generally retryable
            return true;
        }
        const status = error.response.status;
        // Retry on server errors and rate limits, but not client errors
        return status >= 500 || status === 429;
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
//# sourceMappingURL=charity-api.js.map