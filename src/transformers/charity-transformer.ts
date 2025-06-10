import { logger } from "../utils/logger.js";
import { 
  CharityLookupOutput, 
  PublicCharityCheckOutput, 
  CharitySearchOutput 
} from "../schemas/charity-schemas.js";

export class CharityTransformer {
  /**
   * Transform charity lookup API response to standardized format
   */
  static transformCharityLookup(apiResponse: any, originalEIN: string): CharityLookupOutput {
    logger.debug("Transforming charity lookup response", { originalEIN });

    const data = apiResponse.data || {};
    
    // Normalize and clean data
    const transformed: CharityLookupOutput = {
      ein: this.normalizeEIN(data.ein || originalEIN),
      name: this.normalizeName(data.name || data.eligibilityName),
      city: this.normalizeLocation(data.city),
      state: this.normalizeState(data.state || data.eligibilityState),
      country: this.normalizeCountry(data.country),
      deductibilityCode: this.normalizeCode(data.deductibilityCode),
      deductibilityDetail: this.normalizeText(data.deductibilityDetail || data.eligibilityDeductibility),
      status: this.normalizeText(data.eligibilityStatus),
      classification: this.normalizeText(data.eligibilityClassification),
      activity: this.normalizeText(data.eligibilityActivity),
      organization: this.normalizeText(data.eligibilityOrganization),
      ruling: this.normalizeText(data.eligibilityRuling),
      foundation: this.normalizeText(data.eligibilityFoundation),
    };

    // Remove undefined values
    Object.keys(transformed).forEach(key => {
      if (transformed[key as keyof CharityLookupOutput] === undefined) {
        delete transformed[key as keyof CharityLookupOutput];
      }
    });

    logger.debug("Charity lookup transformation complete", { 
      originalEIN,
      transformedName: transformed.name 
    });

    return transformed;
  }

  /**
   * Transform public charity check API response to standardized format
   */
  static transformPublicCharityCheck(apiResponse: any, originalEIN: string): PublicCharityCheckOutput {
    logger.debug("Transforming public charity check response", { originalEIN });

    const data = apiResponse.data || {};
    
    const transformed: PublicCharityCheckOutput = {
      ein: this.normalizeEIN(data.ein || originalEIN),
      isPublicCharity: Boolean(data.public_charity),
      deductible: Boolean(data.public_charity), // Public charity status typically indicates deductibility
    };

    logger.debug("Public charity check transformation complete", { 
      originalEIN,
      isPublicCharity: transformed.isPublicCharity 
    });

    return transformed;
  }

  /**
   * Transform charity search API response to standardized format
   */
  static transformCharitySearch(apiResponse: any, searchParams: any): CharitySearchOutput {
    logger.debug("Transforming charity search response", { searchParams });

    const results = apiResponse.data || [];
    
    const transformedResults = results.map((charity: any) => ({
      ein: this.normalizeEIN(charity.ein),
      name: this.normalizeName(charity.name),
      city: this.normalizeLocation(charity.city),
      state: this.normalizeState(charity.state),
      deductibilityCode: this.normalizeCode(charity.deductibilityCode),
    })).filter((charity: any) => charity.ein && charity.name); // Filter out invalid entries

    const transformed: CharitySearchOutput = {
      results: transformedResults,
    };

    logger.debug("Charity search transformation complete", { 
      resultCount: transformedResults.length
    });

    return transformed;
  }

  /**
   * Normalize EIN format
   */
  private static normalizeEIN(ein: string | undefined): string {
    if (!ein) return '';
    
    const cleaned = ein.replace(/[^\d]/g, '');
    if (cleaned.length === 9) {
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
    }
    return ein; // Return as-is if format is unexpected
  }

  /**
   * Normalize organization name
   */
  private static normalizeName(name: string | undefined): string {
    if (!name) return 'Name not available';
    
    // Trim and normalize spaces
    let normalized = name.trim().replace(/\s+/g, ' ');
    
    // Convert to title case if all caps
    if (normalized === normalized.toUpperCase() && normalized.length > 3) {
      normalized = this.toTitleCase(normalized);
    }
    
    return normalized;
  }

  /**
   * Normalize location strings (city names)
   */
  private static normalizeLocation(location: string | undefined): string | undefined {
    if (!location) return undefined;
    
    let normalized = location.trim().replace(/\s+/g, ' ');
    
    // Convert to title case if all caps
    if (normalized === normalized.toUpperCase()) {
      normalized = this.toTitleCase(normalized);
    }
    
    return normalized.length > 0 ? normalized : undefined;
  }

  /**
   * Normalize state codes
   */
  private static normalizeState(state: string | undefined): string | undefined {
    if (!state) return undefined;
    
    const normalized = state.trim().toUpperCase();
    return normalized.length === 2 ? normalized : undefined;
  }

  /**
   * Normalize country codes
   */
  private static normalizeCountry(country: string | undefined): string | undefined {
    if (!country) return 'US'; // Default to US
    
    const normalized = country.trim().toUpperCase();
    
    // Map common variations
    const countryMap: { [key: string]: string } = {
      'UNITED STATES': 'US',
      'USA': 'US',
      'AMERICA': 'US',
      'U.S.': 'US',
      'U.S.A.': 'US',
    };
    
    return countryMap[normalized] || normalized;
  }

  /**
   * Normalize codes (deductibility, classification, etc.)
   */
  private static normalizeCode(code: string | undefined): string | undefined {
    if (!code) return undefined;
    
    return code.trim().toUpperCase() || undefined;
  }

  /**
   * Normalize text fields
   */
  private static normalizeText(text: string | undefined): string | undefined {
    if (!text) return undefined;
    
    const normalized = text.trim().replace(/\s+/g, ' ');
    return normalized.length > 0 ? normalized : undefined;
  }

  /**
   * Normalize numeric values
   */
  private static normalizeNumber(value: any, defaultValue: number): number {
    if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
      return Math.max(0, Math.floor(value));
    }
    return defaultValue;
  }


  /**
   * Convert string to title case
   */
  private static toTitleCase(str: string): string {
    return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
  }
}
