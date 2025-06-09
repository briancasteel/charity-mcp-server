import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { CHARITY_LOOKUP_TOOL, handleCharityLookup } from "./charity-lookup.js";
import { PUBLIC_CHARITY_CHECK_TOOL, handlePublicCharityCheck } from "./public-charity-check.js";
import { CHARITY_SEARCH_TOOL, handleCharitySearch } from "./charity-search.js";
import { LIST_ORGANIZATIONS_TOOL, handleListOrganizations } from "./list-organizations.js";
import { logger } from "../utils/logger.js";

export function registerAllTools(server: Server) {
  try {
    // Register tools list handler
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        CHARITY_LOOKUP_TOOL,
        PUBLIC_CHARITY_CHECK_TOOL,
        CHARITY_SEARCH_TOOL,
        LIST_ORGANIZATIONS_TOOL,
      ],
    }));

    // Register tool call handler
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "charity_lookup":
          return await handleCharityLookup(args);
        
        case "public_charity_check":
          return await handlePublicCharityCheck(args);
        
        case "charity_search":
          return await handleCharitySearch(args);
        
        case "list_organizations":
          return await handleListOrganizations(args);
        
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });

    logger.info("All charity tools registered successfully", {
      tools: [
        CHARITY_LOOKUP_TOOL.name,
        PUBLIC_CHARITY_CHECK_TOOL.name,
        CHARITY_SEARCH_TOOL.name,
        LIST_ORGANIZATIONS_TOOL.name,
      ],
    });
  } catch (error) {
    logger.error("Failed to register tools", { error });
    throw error;
  }
}

// Export individual tools for testing
export {
  CHARITY_LOOKUP_TOOL,
  PUBLIC_CHARITY_CHECK_TOOL,
  CHARITY_SEARCH_TOOL,
  LIST_ORGANIZATIONS_TOOL,
  handleCharityLookup,
  handlePublicCharityCheck,
  handleCharitySearch,
  handleListOrganizations,
};
