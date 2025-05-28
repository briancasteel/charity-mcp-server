import { logger } from "../utils/logger.js";
import { 
  CharityLookupOutput, 
  PublicCharityCheckOutput, 
  CharitySearchOutput 
} from "../schemas/charity-schemas.js";

export class ResponseFormatter {
  /**
   * Format charity lookup response for display
   */
  static formatCharityLookup(charity: CharityLookupOutput): string {
    logger.debug("Formatting charity lookup response", { ein: charity.ein });

    const sections: string[] = [];

    // Header
    sections.push(`# 🏛️ Charity Information\n`);

    // Basic Information
    const basicInfo: string[] = [];
    basicInfo.push(`**Name:** ${charity.name}`);
    basicInfo.push(`**EIN:** ${charity.ein}`);
    
    if (charity.city || charity.state) {
      const location = [charity.city, charity.state].filter(Boolean).join(', ');
      const country = charity.country && charity.country !== 'US' ? `, ${charity.country}` : '';
      basicInfo.push(`**Location:** ${location}${country}`);
    }

    sections.push(basicInfo.join('\n'));

    // Tax Status Section
    if (charity.deductibilityDetail || charity.deductibilityCode || charity.status) {
      sections.push(`\n## 💰 Tax Status`);
      const taxInfo: string[] = [];
      
      if (charity.deductibilityDetail) {
        taxInfo.push(`**Tax Deductibility:** ${charity.deductibilityDetail}`);
      } else if (charity.deductibilityCode) {
        taxInfo.push(`**Deductibility Code:** ${charity.deductibilityCode}`);
      }
      
      if (charity.status) {
        taxInfo.push(`**IRS Status:** ${charity.status}`);
      }
      
      sections.push(taxInfo.join('\n'));
    }

    // Organization Details Section
    if (charity.classification || charity.activity || charity.foundation) {
      sections.push(`\n## 📋 Organization Details`);
      const orgInfo: string[] = [];
      
      if (charity.classification) {
        orgInfo.push(`**Classification:** ${charity.classification}`);
      }
      
      if (charity.activity) {
        orgInfo.push(`**Primary Activity:** ${charity.activity}`);
      }
      
      if (charity.foundation) {
        orgInfo.push(`**Foundation Type:** ${charity.foundation}`);
      }
      
      sections.push(orgInfo.join('\n'));
    }

    // Legal Information Section
    if (charity.ruling) {
      sections.push(`\n## ⚖️ Legal Information`);
      sections.push(`**IRS Ruling:** ${charity.ruling}`);
    }

    const formatted = sections.join('\n');
    logger.debug("Charity lookup formatting completed");
    return formatted;
  }

  /**
   * Format public charity check response for display
   */
  static formatPublicCharityCheck(result: PublicCharityCheckOutput): string {
    logger.debug("Formatting public charity check response", { 
      ein: result.ein, 
      isPublicCharity: result.isPublicCharity 
    });

    const status = result.isPublicCharity ? '✅ **Yes**' : '❌ **No**';
    const deductible = result.deductible ? '✅ **Yes**' : '❌ **No**';
    
    let response = `# 🔍 Public Charity Status Check\n\n`;
    response += `**EIN:** ${result.ein}\n`;
    response += `**Public Charity Status:** ${status}\n`;
    response += `**Tax-Deductible Donations:** ${deductible}\n\n`;

    if (result.isPublicCharity) {
      response += `## ✅ This organization is a public charity\n\n`;
      response += `This organization is recognized as a public charity under IRS section 501(c)(3). `;
      response += `Donations to this organization are generally **tax-deductible** for donors who itemize deductions.\n\n`;
      response += `💡 **Note:** Always consult with a tax professional for specific advice about deductibility.`;
    } else {
      response += `## ❌ This organization is not classified as a public charity\n\n`;
      response += `This organization is either:\n`;
      response += `• Not found in the IRS database\n`;
      response += `• Not a 501(c)(3) organization\n`;
      response += `• A private foundation rather than a public charity\n\n`;
      response += `**⚠️ Important:** Donations may not be tax-deductible.`;
    }

    logger.debug("Public charity check formatting completed");
    return response;
  }

  /**
   * Format charity search response for display
   */
  static formatCharitySearch(output: CharitySearchOutput, searchCriteria: any): string {
    logger.debug("Formatting charity search response", { 
      resultCount: output.results.length,
      totalResults: output.pagination.total 
    });

    const { results, pagination } = output;
    
    let response = `# 🔎 Charity Search Results\n\n`;
    
    // Search summary
    const criteria: string[] = [];
    if (searchCriteria.query) criteria.push(`Query: "${searchCriteria.query}"`);
    if (searchCriteria.city) criteria.push(`City: ${searchCriteria.city}`);
    if (searchCriteria.state) criteria.push(`State: ${searchCriteria.state}`);
    
    response += `**Search Criteria:** ${criteria.join(', ')}\n`;
    response += `**Results Shown:** ${results.length} organizations\n`;
    response += `**Total Available:** ${pagination.total.toLocaleString()} organizations\n`;
    response += `**Page:** ${pagination.page}\n\n`;

    if (results.length === 0) {
      response += `## 📭 No Results Found\n\n`;
      response += `No organizations found matching your search criteria.\n\n`;
      response += `### 💡 Try these suggestions:\n`;
      response += `• **Broaden your search** - Use fewer or more general terms\n`;
      response += `• **Check spelling** - Verify organization name and location\n`;
      response += `• **Use different keywords** - Try alternative names or abbreviations\n`;
      response += `• **Search by location only** - Try just city or state\n`;
      return response;
    }

    // Results listing
    response += `## 📊 Search Results\n\n`;
    
    results.forEach((charity, index) => {
      const resultNumber = pagination.page > 1 
        ? (pagination.page - 1) * pagination.limit + index + 1 
        : index + 1;
      
      response += `### ${resultNumber}. ${charity.name}\n`;
      response += `**EIN:** \`${charity.ein}\`\n`;
      
      if (charity.city || charity.state) {
        response += `**Location:** ${[charity.city, charity.state].filter(Boolean).join(', ')}\n`;
      }
      
      if (charity.deductibilityCode) {
        const deductibilityStatus = this.interpretDeductibilityCode(charity.deductibilityCode);
        response += `**Deductibility:** ${deductibilityStatus}\n`;
      }
      
      response += `\n`;
    });

    // Pagination info
    if (pagination.hasMore) {
      const nextOffset = pagination.page * pagination.limit;
      response += `---\n\n`;
      response += `### 📄 More Results Available\n`;
      response += `There are additional results available. `;
      response += `Use \`offset=${nextOffset}\` to see the next ${pagination.limit} results.\n`;
    }

    logger.debug("Charity search formatting completed");
    return response;
  }

  /**
   * Interpret deductibility codes for user-friendly display
   */
  private static interpretDeductibilityCode(code: string): string {
    const codeMap: { [key: string]: string } = {
      'PC': '✅ Public Charity (Tax-deductible)',
      'PF': '⚠️ Private Foundation (Limited deductibility)',
      'POF': '⚠️ Private Operating Foundation',
      'SO': '✅ Supporting Organization',
      'LODGE': '❓ Fraternal Lodge',
      'UNKWN': '❓ Status Unknown',
    };

    return codeMap[code.toUpperCase()] || `${code} (Contact organization for details)`;
  }

  /**
   * Format success message with metadata
   */
  static formatSuccessMessage(operation: string, metadata?: any): string {
    let message = `✅ ${operation} completed successfully`;
    
    if (metadata) {
      const details: string[] = [];
      if (metadata.processingTime) {
        details.push(`Processing time: ${metadata.processingTime}ms`);
      }
      if (metadata.resultCount !== undefined) {
        details.push(`Results: ${metadata.resultCount}`);
      }
      if (details.length > 0) {
        message += ` (${details.join(', ')})`;
      }
    }
    
    return message;
  }
}
