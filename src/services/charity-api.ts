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

export interface OrganizationResponse {
  data: {
      zip: string;              // zip code
      tax_period: string;       // This is the tax period of the latest return filed (YYYYMM).
      subsection: string;       // Subsection Codes are the codes shown under section 501(c) of the Internal Revenue Code of 1986, which define the category under which an organization may be exempt. A table of subsection and classification codes (which reflects a further breakdown of the Internal Revenue Code subsections) can be found in the section entitled 'Table of EO Subsection and Classification Codes' (https://www.irs.gov/pub/irs-soi/eo_info.pdf). One to four different classification codes may be present.
      street: string;           // Street Address Line 1
      status: string;           // The EO Status Code defines the type of exemption held by the organization. The following is a list of EO status codes and\n        their definitions included in these files:\n         Code Description\n        01 Unconditional Exemption\n        02 Conditional Exemption\n        12 Trust described in section 4947(a)(2) of the IR Code\n        25 Organization terminating its private foundation status under section 507(b)(1)(B) of the Code
      state: string;            // state
      sort_name: string;        // Sort Name Line is another name under which the organization does business. Also used for trade names, chapter names,\n        or local numbers for subordinate organizations of group rulings. Check this field in addition to the name field when confirming identity.
      ruling: string;           // This is the month and year (YYYYMM) on a ruling or determination letter recognizing the organization's exempt status.
      revenue_amt: string;      // Amount from Form 990, Part 1, Line 12, or Part 1, Line 9, of Form 990EZ.
      pf_filing_req_cd: string; // 1 990-PF return\n        0 No 990-PF return
      organization: string;     // This defines the type of organization as follows:\n        Code Description\n        1 Corporation\n        2 Trust\n        3 Co-operative\n        4 Partnership\n        5 Association
      ntee_cd: string;          // National Taxonomy of Exempt Entities Code.
      name: string;             // The name of the organization
       income_cd: string;        // Income Codes relate to the amount of income shown on the most recent Form 990 series return filed by the organization.\n        ASSET CODE/INCOME CODE TABLE\n        Code Description($)\n        0 0\n        1 1 to 9,999\n        2 10,000 to 24,999\n        3 25,000 to 99,999\n        4 100,000 to 499,999\n        5 500,000 to 999,999\n        6 1,000,000 to 4,999,999\n        7 5,000,000 to 9,999,999\n        8 10,000,000 to 49,999,999\n        9 50,000,000 to greater
      income_amt: string;       // Income Amount is a computer generated amount from the most recent Form 990 series return filed by the organization.\n        Income Amount is computer generated using PART I, Total Revenue Line 12 and adding 'back in' the expense items, i.e.\n        Line 6b (Rental Expenses) shown on the Form 990 return. On Form 990EZ it is generated using PART I, Line 9 and\n        adding 'back in' the expense items, i.e. Line 5b (Cost or Other Basis Expenses). Income Amount for Form 990PF is\n        generated using Part I, Line 10b (Cost of Goods) and adding Part I, Line 12, Col. (A) (Total Revenue Col. A) and Part IV,\n        Line 1, Col. (G) (Cost or Other Basis). This field is dollars only.
      ico: string;              // In Care Of - the person to whom correspondence should be addressed.
      group: string;            // This is a four-digit IRS-internal number assigned to central/parent organizations holding group exemption letters.
      foundation: string;       // Foundation Code.\n        00 All organizations except 501(c)(3)\n        02 Private operating foundation exempt from paying excise taxes on investment income\n        03 Private operating foundation (other)\n        04 Private non-operating foundation\n        09 Suspense\n        10 Church 170(b)(1)(A)(i)\n        11 School 170(b)(1)(A)(ii)\n        12 Hospital or medical research organization 170(b)(1)(A)(iii)\n        13 Organization which operates for benefit of college or university and is owned or operated by a governmental\n        unit 170(b)(1)(A)(iv)\n        14 Governmental unit 170(b)(1)(A)(v)\n        15 Organization which receives a substantial part of its support from a governmental unit or the general public\n        170(b)(1)(A)(vi)\n        16 Organization that normally receives no more than one-third of its support from gross investment income and\n        unrelated business income and at the same time more than one-third of its support from\n        contributions, fees, and gross receipts related to exempt purposes. 509(a)(2)\n        17 Organizations operated solely for the benefit of and in conjunction with organizations described in 10 through\n        16 above. 509(a)(3)\n        18 Organization organized and operated to test for public safety 509(a)(4)\n        21 509(a)(3) Type I\n        22 509(a)(3) Type II\n        23 509(a)(3) Type III functionally integrated\n        24 509(a)(3) Type III not functionally integrated
      filing_req_cd: string;    // This indicates the primary return(s) the organization is required to file.\n        01 990 (all other) or 990EZ return\n        02 990 - Required to file Form 990-N - Income less than $25,000 per year\n        03 990 - Group return\n        04 990 - Required to file Form 990-BL, Black Lung Trusts\n        06 990 - Not required to file (church)\n        07 990 - Government 501(c)(1)\n        13 990 - Not required to file (religious organization)\n        14 990 - Not required to file (instrumentalities of states or political subdivisions)\n        00 990 - Not required to file (all other)
      ein: string;              // Employer Identification Number, or Tax ID Number
      deductibility: string;    // Deductibility Code signifies whether contributions made to an organization are deductible.\n        1: Contributions are deductible.\n        2: Contributions are not deductible.\n        4: Contributions are deductible by treaty (foreign organizations).
      classification: string;   // Subsection Codes are the codes shown under section 501(c) of the Internal Revenue Code of 1986, which define the\n        category under which an organization may be exempt. A table of subsection and classification codes (which reflects a\n        further breakdown of the Internal Revenue Code subsections) can be found in the section entitled 'Table of EO Subsection\n        and Classification Codes' (https://www.irs.gov/pub/irs-soi/eo_info.pdf). One to four different classification codes may be present.
      city: string;             // city
      asset_cd: string;         // Asset Codes relate to the book value amount of assets shown on the most recent Form 990 series return filed by the\n        organization.\n        ASSET CODE/INCOME CODE TABLE\n        Code Description($)\n        0 0\n        1 1 to 9,999\n        2 10,000 to 24,999\n        3 25,000 to 99,999\n        4 100,000 to 499,999\n        5 500,000 to 999,999\n        6 1,000,000 to 4,999,999\n        7 5,000,000 to 9,999,999\n        8 10,000,000 to 49,999,999\n        9 50,000,000 to greater
      asset_amt: string;        // Asset Amount.\n        Asset Amount is an amount from the most recent Form 990 series return filed by the organization. Asset Amount is the\n        Book Value Total Assets End of Year - PART X Balance Sheet Line 16 Col. (B) shown on the Form 990. This field is also\n        from PART II, Line 25, Col. (B) EOY on Form 990EZ and PART II, Line 16, Col. (b) on Form 990PF. This field is dollars\n        only.
      affiliation: string;      // Organization Grouping, based on the following split:\n        1: Central - This code is used if the organization is a central type organization (no group exemption) of a National,\n        Regional or Geographic grouping of organizations.\n        2: Intermediate - This code is used if the organization is an intermediate organization (no group exemption) of a\n        National, Regional or Geographic grouping of organizations (such as a state headquarters of a national\n        organization).\n        3: Independent - This code is used if the organization is an independent organization or an independent auxiliary\n        (i.e., not affiliated with a National, Regional, or Geographic grouping of organizations).\n        6: Central - This code is used if the organization is a parent (group ruling) and is not a church or 501(c)(1)\n        organization.\n        7: Intermediate - This code is used if the organization is a group exemption intermediate organization of a National,\n        Regional or Geographic grouping of organizations.\n        8: Central - This code is used if the organization is a parent (group ruling) and is a church or 501(c)(1) organization.\n        9: Subordinate - This code is used if the organization is a subordinate in a group ruling.
      activity: string;         // Description Not Available
      acct_pd: string;          // Accounting Period. This designates the accounting period or fiscal year ending date (Jan - Dec) of the organization (MM)
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

  async listOrganizations(since: Date): Promise<OrganizationResponse> {
    try {
      const response = await this.retryRequest(() =>
        this.client.get('/api/organizations?since=', {
          params: { since: since.toISOString() }
        })
      );
      return response.data;
    } catch (error) {
      logger.error('List organizations failed', { since, error });
      throw error;
    }
  }

  async getOrganizationByEIN(ein: string): Promise<OrganizationResponse> {
    try {
      const response = await this.retryRequest(() =>
        this.client.get(`/api/organizations/${ein}`)
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
