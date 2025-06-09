import { CallToolResult, TextContent } from "@modelcontextprotocol/sdk/types.js";
import { charityAPIClient, rateLimiter } from "../index.js";
import { ListOrganizationsInputSchema, ListOrganizationsInput, ListOrganizationsOutput } from "../schemas/charity-schemas.js";
import { logger } from "../utils/logger.js";
import { handleMCPError, CharityAPIError } from "../utils/error-handler.js";

export const LIST_ORGANIZATIONS_TOOL = {
  name: "List Organizations",
  description: `
    List nonprofit organizations from the IRS database that have been updated since a specified date.
    This tool retrieves organizations that have had changes to their tax-exempt status or filing information.
    
    Parameters:
    - since: ISO date string (required) - Get organizations updated since this date (e.g., "2024-01-01T00:00:00Z")
    - limit: Number of results to return (1-1000, default 100)
    - offset: Skip first N results for pagination (default 0)
    
    Returns detailed information about organizations including:
    - Basic information (EIN, name, address)
    - Tax status and classification details
    - Financial information (revenue, assets)
    - Filing requirements and ruling dates
    
    Use this tool to get bulk organization data or track recent changes to nonprofit status.
  `.trim(),
  inputSchema: {
    type: "object" as const,
    properties: {
      since: {
        type: "string",
        description: "ISO date string to get organizations updated since this date (e.g., '2024-01-01T00:00:00Z')",
        format: "date-time",
      },
      limit: {
        type: "number",
        description: "Number of results to return (1-1000, default 100)",
        minimum: 1,
        maximum: 1000,
        default: 100,
      },
      offset: {
        type: "number",
        description: "Number of results to skip for pagination (default 0)",
        minimum: 0,
        default: 0,
      },
    },
    required: ["since"],
  },
};

export async function handleListOrganizations(args: unknown): Promise<CallToolResult> {
  try {
    logger.debug("List organizations requested", { args });

    // Validate input
    const input = ListOrganizationsInputSchema.parse(args);
    logger.debug("Input validated", { input });

    // Check rate limit
    if (!(await rateLimiter.checkRateLimit('list_organizations'))) {
      const resetTime = rateLimiter.getResetTime('list_organizations');
      const resetDate = new Date(resetTime).toISOString();
      
      return {
        content: [
          {
            type: "text",
            text: `Rate limit exceeded for list organizations. Please try again after ${resetDate}.`,
          } as TextContent,
        ],
        isError: true,
      };
    }

    // Make API call
    logger.info("Listing organizations", { since: input.since.toISOString(), limit: input.limit, offset: input.offset });
    const response = await charityAPIClient.listOrganizations(input.since);
    
    if (!response.data) {
      throw new CharityAPIError("No data returned from CharityAPI", 404);
    }

    // Handle the response data - it should be an array or single organization
    const organizations = Array.isArray(response.data) ? response.data : [response.data];
    
    // Apply pagination manually since API might not support it
    const startIndex = input.offset;
    const endIndex = startIndex + input.limit;
    const paginatedOrgs = organizations.slice(startIndex, endIndex);

    // Format response
    const output: ListOrganizationsOutput = {
      organizations: paginatedOrgs.map(org => ({
        ein: org.ein,
        name: org.name,
        city: org.city,
        state: org.state,
        zip: org.zip,
        street: org.street,
        status: org.status,
        classification: org.classification,
        subsection: org.subsection,
        foundation: org.foundation,
        activity: org.activity,
        organization: org.organization,
        deductibility: org.deductibility,
        ruling: org.ruling,
        taxPeriod: org.tax_period,
        revenueAmount: org.revenue_amt,
        incomeAmount: org.income_amt,
        assetAmount: org.asset_amt,
      })),
      pagination: {
        total: organizations.length,
        page: Math.floor(input.offset / input.limit) + 1,
        limit: input.limit,
        hasMore: (input.offset + input.limit) < organizations.length,
      },
      since: input.since,
    };

    // Create formatted text response
    const formattedText = formatListOrganizationsResponse(output, input);

    logger.info("List organizations completed successfully", { 
      resultCount: output.organizations.length,
      totalAvailable: organizations.length,
      since: input.since.toISOString()
    });

    return {
      content: [
        {
          type: "text",
          text: formattedText,
        } as TextContent,
      ],
    };

  } catch (error) {
    logger.error("List organizations failed", { args, error });
    
    const mcpError = handleMCPError(error);
    return {
      content: [
        {
          type: "text",
          text: mcpError.message,
        } as TextContent,
      ],
      isError: true,
    };
  }
}

function formatListOrganizationsResponse(output: ListOrganizationsOutput, input: ListOrganizationsInput): string {
  const { organizations, pagination, since } = output;
  
  let response = `# Organizations List\n\n`;
  
  // Query summary
  response += `**Updated Since:** ${since.toISOString()}\n`;
  response += `**Results:** ${organizations.length} organizations (Page ${pagination.page})\n`;
  response += `**Total Available:** ${pagination.total} organizations\n\n`;

  if (organizations.length === 0) {
    response += `No organizations found that have been updated since ${since.toISOString()}.\n`;
    response += `Try using an earlier date to see more results.\n`;
    return response;
  }

  // Organizations listing
  organizations.forEach((org, index) => {
    const resultNumber = pagination.page > 1 
      ? (pagination.page - 1) * pagination.limit + index + 1 
      : index + 1;
    
    response += `## ${resultNumber}. ${org.name}\n`;
    response += `**EIN:** ${org.ein}\n`;
    
    // Address information
    const addressParts = [org.street, org.city, org.state, org.zip].filter(Boolean);
    if (addressParts.length > 0) {
      response += `**Address:** ${addressParts.join(', ')}\n`;
    }
    
    // Status and classification
    if (org.status) {
      response += `**Status:** ${getStatusDescription(org.status)}\n`;
    }
    
    if (org.subsection) {
      response += `**Subsection:** 501(c)(${org.subsection})\n`;
    }
    
    if (org.classification) {
      response += `**Classification:** ${org.classification}\n`;
    }
    
    if (org.foundation) {
      response += `**Foundation Code:** ${org.foundation}\n`;
    }
    
    // Financial information
    if (org.revenueAmount && org.revenueAmount !== '0') {
      response += `**Revenue:** $${formatCurrency(org.revenueAmount)}\n`;
    }
    
    if (org.assetAmount && org.assetAmount !== '0') {
      response += `**Assets:** $${formatCurrency(org.assetAmount)}\n`;
    }
    
    // Tax information
    if (org.taxPeriod) {
      response += `**Tax Period:** ${formatTaxPeriod(org.taxPeriod)}\n`;
    }
    
    if (org.ruling) {
      response += `**Ruling Date:** ${formatRulingDate(org.ruling)}\n`;
    }
    
    if (org.deductibility) {
      response += `**Deductible:** ${org.deductibility === '1' ? 'Yes' : 'No'}\n`;
    }
    
    response += `\n`;
  });

  // Pagination info
  if (pagination.hasMore) {
    const nextOffset = pagination.page * pagination.limit;
    response += `---\n`;
    response += `**More Results Available:** Use offset=${nextOffset} to see the next ${pagination.limit} results.\n`;
  }

  return response;
}

function getStatusDescription(status: string): string {
  const statusMap: { [key: string]: string } = {
    '01': 'Unconditional Exemption',
    '02': 'Conditional Exemption',
    '12': 'Trust described in section 4947(a)(2)',
    '25': 'Organization terminating private foundation status',
  };
  return statusMap[status] || `Status Code: ${status}`;
}

function formatCurrency(amount: string): string {
  const num = parseInt(amount);
  if (isNaN(num)) return amount;
  return num.toLocaleString();
}

function formatTaxPeriod(period: string): string {
  if (period.length === 6) {
    const year = period.substring(0, 4);
    const month = period.substring(4, 6);
    return `${month}/${year}`;
  }
  return period;
}

function formatRulingDate(ruling: string): string {
  if (ruling.length === 6) {
    const year = ruling.substring(0, 4);
    const month = ruling.substring(4, 6);
    return `${month}/${year}`;
  }
  return ruling;
}
