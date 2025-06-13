import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ListPromptsRequestSchema, GetPromptRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { VERIFICATION_PROMPTS, handleVerificationPrompt } from "./verification-prompts.js";
import { QUICK_REFERENCE_PROMPTS, handleQuickReferencePrompt } from "./quick-reference-prompts.js";
import { logger } from "../utils/logger.js";

export function registerAllPrompts(server: Server) {
  try {
    // Register prompts list handler
    server.setRequestHandler(ListPromptsRequestSchema, async () => ({
      prompts: [
        ...VERIFICATION_PROMPTS,
        ...QUICK_REFERENCE_PROMPTS,
      ],
    }));

    // Register prompt get handler
    server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      // Handle verification prompts
      for (const prompt of VERIFICATION_PROMPTS) {
        if (prompt.name === name) {
          return await handleVerificationPrompt(name, args);
        }
      }

      // Handle quick reference prompts
      for (const prompt of QUICK_REFERENCE_PROMPTS) {
        if (prompt.name === name) {
          return await handleQuickReferencePrompt(name, args);
        }
      }

      throw new Error(`Unknown prompt: ${name}`);
    });

    logger.info("All charity prompts registered successfully", {
      prompts: [
        ...VERIFICATION_PROMPTS.map(p => p.name),
        ...QUICK_REFERENCE_PROMPTS.map(p => p.name),
      ],
    });
  } catch (error) {
    logger.error("Failed to register prompts", { error });
    throw error;
  }
}

// Export individual prompts for testing
export {
  VERIFICATION_PROMPTS,
  QUICK_REFERENCE_PROMPTS,
  handleVerificationPrompt,
  handleQuickReferencePrompt,
};
