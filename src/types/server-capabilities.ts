export interface ServerCapabilities {
  tools: {
    charityLookup: boolean;
    publicCharityCheck: boolean;
    charitySearch: boolean;
    listOrganizations: boolean;
  };
  resources: {
    cachedCharities: boolean;
    searchHistory: boolean;
  };
  prompts: {
    charityAnalysis: boolean;
    donationGuidance: boolean;
  };
}

export interface ServerConfig {
  name: string;
  version: string;
  capabilities: ServerCapabilities;
  maxConcurrentRequests: number;
  requestTimeoutMs: number;
  enableCaching: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}
