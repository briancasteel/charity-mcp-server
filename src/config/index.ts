import { CharityAPIConfig } from '../services/charity-api.js';
import { ServerConfig } from '../types/server-capabilities.js';

// Load environment variables from .env file 
import * as dotenv from 'dotenv';
dotenv.config();

export function loadCharityAPIConfig(): CharityAPIConfig {
  return {
  
    baseURL: process.env.CHARITY_API_BASE_URL || 'https://api.charityapi.org',
    apiKey: process.env.CHARITY_API_KEY,
    timeout: parseInt(process.env.CHARITY_API_TIMEOUT || '10000'),
    maxRetries: parseInt(process.env.CHARITY_API_MAX_RETRIES || '3'),
    retryDelay: parseInt(process.env.CHARITY_API_RETRY_DELAY || '1000'),
  };
}

export function loadServerConfig(): ServerConfig {
  return {
    name: 'charity-api-server',
    version: '1.0.0',
    capabilities: {
      tools: {
        charityLookup: true,
        publicCharityCheck: true,
        charitySearch: true,
        listOrganizations: true,
      },
      resources: {
        cachedCharities: false, // Can be enabled later
        searchHistory: false,
      },
      prompts: {
        charityAnalysis: false, // Can be enabled later
        donationGuidance: false,
      },
    },
    maxConcurrentRequests: parseInt(process.env.MAX_CONCURRENT_REQUESTS || '10'),
    requestTimeoutMs: parseInt(process.env.REQUEST_TIMEOUT_MS || '30000'),
    enableCaching: process.env.ENABLE_CACHING === 'true',
    logLevel: (process.env.LOG_LEVEL as any) || 'info',
  };
}

export function validateConfig(config: CharityAPIConfig): void {
  if (!config.baseURL) {
    throw new Error('CHARITY_API_BASE_URL is required');
  }

  if (config.timeout < 1000) {
    throw new Error('Timeout must be at least 1000ms');
  }

  if (config.maxRetries < 0 || config.maxRetries > 10) {
    throw new Error('maxRetries must be between 0 and 10');
  }
}
