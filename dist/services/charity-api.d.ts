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
export declare class CharityAPIClient {
    private client;
    private config;
    constructor(config: CharityAPIConfig);
    private createAxiosInstance;
    private handleAxiosError;
    lookupCharity(ein: string): Promise<CharityLookupResponse>;
    checkPublicCharity(ein: string): Promise<PublicCharityCheckResponse>;
    searchCharities(params: {
        q?: string;
        city?: string;
        state?: string;
        limit?: number;
        offset?: number;
    }): Promise<CharitySearchResponse>;
    private retryRequest;
    private isRetryableError;
    private delay;
}
//# sourceMappingURL=charity-api.d.ts.map