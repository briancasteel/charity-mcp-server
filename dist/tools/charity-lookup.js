import { charityAPIClient, rateLimiter } from "../index.js";
import { CharityLookupInputSchema } from "../schemas/charity-schemas.js";
import { logger } from "../utils/logger.js";
import { handleMCPError, CharityAPIError } from "../utils/error-handler.js";
export const CHARITY_LOOKUP_TOOL = {
    name: "charity_lookup",
    description: `
    Look up detailed information about a charity or nonprofit organization using their EIN (Employer Identification Number).
    This tool retrieves comprehensive information from the IRS database including:
    - Official organization name
    - Physical address (city, state, country)
    - Tax deductibility status and codes
    - Organization classification and activity codes
    - Current status with the IRS
    - Foundation type and ruling information
    
    Use this tool when you need complete details about a specific charity.
  `.trim(),
    inputSchema: {
        type: "object",
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
export async function handleCharityLookup(args) {
    try {
        logger.debug("Charity lookup requested", { args });
        // Validate input
        const input = CharityLookupInputSchema.parse(args);
        logger.debug("Input validated", { ein: input.ein });
        // Check rate limit
        if (!(await rateLimiter.checkRateLimit('charity_lookup'))) {
            const resetTime = rateLimiter.getResetTime('charity_lookup');
            const resetDate = new Date(resetTime).toISOString();
            return {
                content: [
                    {
                        type: "text",
                        text: `Rate limit exceeded for charity lookup. Please try again after ${resetDate}.`,
                    },
                ],
                isError: true,
            };
        }
        // Make API call
        logger.info("Looking up charity", { ein: input.ein });
        const response = await charityAPIClient.lookupCharity(input.ein);
        if (!response.data) {
            throw new CharityAPIError("No data returned from CharityAPI", 404);
        }
        // Format response
        const charity = response.data;
        const output = {
            ein: charity.ein || input.ein,
            name: charity.name || "Name not available",
            city: charity.city,
            state: charity.state,
            country: charity.country || "US",
            deductibilityCode: charity.deductibilityCode,
            deductibilityDetail: charity.deductibilityDetail,
            status: charity.eligibilityStatus,
            classification: charity.eligibilityClassification,
            activity: charity.eligibilityActivity,
            organization: charity.eligibilityOrganization,
            ruling: charity.eligibilityRuling,
            foundation: charity.eligibilityFoundation,
        };
        // Create formatted text response
        const formattedText = formatCharityLookupResponse(output);
        logger.info("Charity lookup completed successfully", { ein: input.ein, name: charity.name });
        return {
            content: [
                {
                    type: "text",
                    text: formattedText,
                },
            ],
        };
    }
    catch (error) {
        logger.error("Charity lookup failed", { args, error });
        const mcpError = handleMCPError(error);
        return {
            content: [
                {
                    type: "text",
                    text: mcpError.message,
                },
            ],
            isError: true,
        };
    }
}
function formatCharityLookupResponse(charity) {
    let response = `# Charity Information\n\n`;
    response += `**Name:** ${charity.name}\n`;
    response += `**EIN:** ${charity.ein}\n`;
    if (charity.city || charity.state) {
        response += `**Location:** ${[charity.city, charity.state].filter(Boolean).join(', ')}`;
        if (charity.country && charity.country !== 'US') {
            response += `, ${charity.country}`;
        }
        response += `\n`;
    }
    if (charity.deductibilityDetail) {
        response += `**Tax Deductibility:** ${charity.deductibilityDetail}\n`;
    }
    else if (charity.deductibilityCode) {
        response += `**Deductibility Code:** ${charity.deductibilityCode}\n`;
    }
    if (charity.status) {
        response += `**IRS Status:** ${charity.status}\n`;
    }
    if (charity.classification) {
        response += `**Classification:** ${charity.classification}\n`;
    }
    if (charity.activity) {
        response += `**Primary Activity:** ${charity.activity}\n`;
    }
    if (charity.foundation) {
        response += `**Foundation Type:** ${charity.foundation}\n`;
    }
    if (charity.ruling) {
        response += `**IRS Ruling:** ${charity.ruling}\n`;
    }
    return response;
}
//# sourceMappingURL=charity-lookup.js.map