import { CallToolResult, TextContent } from "@modelcontextprotocol/sdk/types.js";
import { charityAPIClient, rateLimiter } from "../index.js";
import { PublicCharityCheckInputSchema, PublicCharityCheckInput, PublicCharityCheckOutput } from "../schemas/charity-schemas.js";
import { logger } from "../utils/logger.js";
import { handleMCPError, CharityAPIError } from "../utils/error-handler.js";

export const PUBLIC_CHARITY_CHECK_TOOL = {
  name: "public-charity-check",
  description: `
    Verify if a nonprofit organization qualifies as a "public charity" according to the IRS.
    Public charities are eligible to receive tax-deductible donations under section 501(c)(3).
    
    This tool returns:
    - Whether the organization is classified as a public charity
    - Tax deductibility status for donations
    - EIN confirmation
    
    Use this tool to quickly verify if donations to an organization are tax-deductible.
  `.trim(),
  inputSchema: {
    type: "object" as const,
    properties: {
      ein: {
        type: "string",
        description: "The charity's EIN (Tax ID) in format XX-XXXXXXX or XXXXXXXXX (e.g., '13-1837418' or '131837418')",
        pattern: "^\\d{2}-?\\d{7}$",
      },
    },
    required: ["ein"],
  },
};

export async function handlePublicCharityCheck(args: unknown): Promise<CallToolResult> {
  try {
    logger.debug("Public charity check requested", { args });

    // Validate input
    const input = PublicCharityCheckInputSchema.parse(args);
    logger.debug("Input validated", { ein: input.ein });

    // Check rate limit
    if (!(await rateLimiter.checkRateLimit('public_charity_check'))) {
      const resetTime = rateLimiter.getResetTime('public_charity_check');
      const resetDate = new Date(resetTime).toISOString();
      
      return {
        content: [
          {
            type: "text",
            text: `Rate limit exceeded for public charity check. Please try again after ${resetDate}.`,
          } as TextContent,
        ],
        isError: true,
      };
    }

    // Make API call
    logger.info("Checking public charity status", { ein: input.ein });
    const response = await charityAPIClient.checkPublicCharity(input.ein);
    
    if (!response.data) {
      throw new CharityAPIError("No data returned from CharityAPI", 404);
    }

    // Format response
    const result = response.data;
    const output: PublicCharityCheckOutput = {
      ein: result.ein || input.ein,
      isPublicCharity: result.public_charity || false,
      deductible: result.public_charity || false,
    };

    // Create formatted text response
    const formattedText = formatPublicCharityCheckResponse(output);

    logger.info("Public charity check completed successfully", { 
      ein: input.ein, 
      isPublicCharity: output.isPublicCharity 
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
    logger.error("Public charity check failed", { args, error });
    
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

function formatPublicCharityCheckResponse(result: PublicCharityCheckOutput): string {
  let response = `# Public Charity Status Check\n\n`;
  response += `**EIN:** ${result.ein}\n`;
  response += `**Public Charity Status:** ${result.isPublicCharity ? '✅ Yes' : '❌ No'}\n`;
  response += `**Tax-Deductible Donations:** ${result.deductible ? '✅ Yes' : '❌ No'}\n\n`;

  if (result.isPublicCharity) {
    response += `This organization is recognized as a public charity under IRS section 501(c)(3). `;
    response += `Donations to this organization are generally tax-deductible for donors who itemize deductions.`;
  } else {
    response += `This organization is not classified as a public charity. `;
    response += `Donations may not be tax-deductible, or the organization may not be found in the IRS database.`;
  }

  return response;
}
