import { CallToolResult, TextContent } from "@modelcontextprotocol/sdk/types.js";
import { charityAPIClient, rateLimiter } from "../index.js";
import { CharitySearchInputSchema, CharitySearchInput, CharitySearchOutput } from "../schemas/charity-schemas.js";
import { logger } from "../utils/logger.js";
import { handleMCPError, CharityAPIError } from "../utils/error-handler.js";

export const CHARITY_SEARCH_TOOL = {
  name: "charity_search",
  description: `
    Search for charities and nonprofit organizations in the IRS database.
    You can search by organization name, location, or combine multiple criteria.
    
    Search parameters:
    - query: Organization name or keywords
    - city: Filter by city name
    - state: Filter by state (2-letter code like 'CA', 'NY')
    - limit: Number of results to return (1-100, default 25)
    - offset: Skip first N results for pagination (default 0)
    
    Returns a list of matching organizations with basic information including:
    - Organization name and EIN
    - Location (city, state)
    - Deductibility status
    
    Use this tool to find organizations when you don't have their exact EIN.
  `.trim(),
  inputSchema: {
    type: "object" as const,
    properties: {
      query: {
        type: "string",
        description: "Search term for organization name or keywords (optional)",
        maxLength: 200,
      },
      city: {
        type: "string",
        description: "Filter by city name (optional)",
        maxLength: 100,
      },
      state: {
        type: "string",
        description: "Filter by state using 2-letter abbreviation like 'CA' or 'NY' (optional)",
        pattern: "^[A-Z]{2}$",
      },
      limit: {
        type: "number",
        description: "Number of results to return (1-100, default 25)",
        minimum: 1,
        maximum: 100,
        default: 25,
      },
      offset: {
        type: "number",
        description: "Number of results to skip for pagination (default 0)",
        minimum: 0,
        default: 0,
      },
    },
    required: [],
  },
};

export async function handleCharitySearch(args: unknown): Promise<CallToolResult> {
  try {
    logger.debug("Charity search requested", { args });

    // Validate input
    const input = CharitySearchInputSchema.parse(args);
    logger.debug("Input validated", { input });

    // Ensure at least one search parameter is provided
    if (!input.query && !input.city && !input.state) {
      return {
        content: [
          {
            type: "text",
            text: "At least one search parameter (query, city, or state) must be provided.",
          } as TextContent,
        ],
        isError: true,
      };
    }

    // Check rate limit
    if (!(await rateLimiter.checkRateLimit('charity_search'))) {
      const resetTime = rateLimiter.getResetTime('charity_search');
      const resetDate = new Date(resetTime).toISOString();
      
      return {
        content: [
          {
            type: "text",
            text: `Rate limit exceeded for charity search. Please try again after ${resetDate}.`,
          } as TextContent,
        ],
        isError: true,
      };
    }

    // Prepare API parameters
    const apiParams = {
      q: input.query,
      city: input.city,
      state: input.state,
      limit: input.limit,
      offset: input.offset,
    };

    // Make API call
    logger.info("Searching charities", { params: apiParams });
    const response = await charityAPIClient.searchCharities(apiParams);
    
    if (!response.data) {
      throw new CharityAPIError("No data returned from CharityAPI", 404);
    }

    // Format response
    const results = Array.isArray(response.data) ? response.data : [];
    const pagination = response.pagination || {
      totalResults: results.length,
      page: Math.floor(input.offset / input.limit) + 1,
      totalPages: Math.ceil(results.length / input.limit),
    };

    const output: CharitySearchOutput = {
      results: results.map(charity => ({
        ein: charity.ein,
        name: charity.name,
        city: charity.city,
        state: charity.state,
        deductibilityCode: charity.deductibilityCode,
      })),
      pagination: {
        total: pagination.totalResults || results.length,
        page: pagination.page || Math.floor(input.offset / input.limit) + 1,
        limit: input.limit,
        hasMore: (input.offset + input.limit) < (pagination.totalResults || results.length),
      },
    };

    // Create formatted text response
    const formattedText = formatCharitySearchResponse(output, input);

    logger.info("Charity search completed successfully", { 
      resultCount: output.results.length,
      searchParams: apiParams 
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
    logger.error("Charity search failed", { args, error });
    
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

function formatCharitySearchResponse(output: CharitySearchOutput, input: CharitySearchInput): string {
  const { results, pagination } = output;
  
  let response = `# Charity Search Results\n\n`;
  
  // Search summary
  const searchCriteria = [];
  if (input.query) searchCriteria.push(`Query: "${input.query}"`);
  if (input.city) searchCriteria.push(`City: ${input.city}`);
  if (input.state) searchCriteria.push(`State: ${input.state}`);
  
  response += `**Search Criteria:** ${searchCriteria.join(', ')}\n`;
  response += `**Results:** ${results.length} organizations (Page ${pagination.page})\n`;
  response += `**Total Available:** ${pagination.total} organizations\n\n`;

  if (results.length === 0) {
    response += `No organizations found matching your search criteria. Try:\n`;
    response += `- Broadening your search terms\n`;
    response += `- Checking spelling of organization name or location\n`;
    response += `- Using fewer filters\n`;
    return response;
  }

  // Results listing
  results.forEach((charity, index) => {
    const resultNumber = pagination.page > 1 
      ? (pagination.page - 1) * pagination.limit + index + 1 
      : index + 1;
    
    response += `## ${resultNumber}. ${charity.name}\n`;
    response += `**EIN:** ${charity.ein}\n`;
    
    if (charity.city || charity.state) {
      response += `**Location:** ${[charity.city, charity.state].filter(Boolean).join(', ')}\n`;
    }
    
    if (charity.deductibilityCode) {
      response += `**Deductibility Code:** ${charity.deductibilityCode}\n`;
    }
    
    response += `\n`;
  });

  // Pagination info
  if (pagination.hasMore) {
    const nextOffset = (pagination.page * pagination.limit);
    response += `---\n`;
    response += `**More Results Available:** Use offset=${nextOffset} to see the next ${pagination.limit} results.\n`;
  }

  return response;
}
