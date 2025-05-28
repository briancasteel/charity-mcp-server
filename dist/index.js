#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadCharityAPIConfig, loadServerConfig, validateConfig } from './config/index.js';
import { CharityAPIClient } from './services/charity-api.js';
import { RateLimiter } from './services/rate-limiter.js';
import { logger } from './utils/logger.js';
import { setupErrorHandlers } from './utils/error-handler.js';
import { registerAllTools } from './tools/index.js';
// Global instances
let charityAPIClient;
let rateLimiter;
let serverConfig;
// Server configuration
const SERVER_CONFIG = {
    name: "charity-api-server",
    version: "1.0.0",
};
// Create MCP server instance
const server = new Server(SERVER_CONFIG, {
    capabilities: {
        tools: {}, // Tools will be registered dynamically
        resources: {}, // Optional: for caching/storing charity data
        prompts: {}, // Optional: for charity-related prompt templates
    },
});
async function main() {
    try {
        logger.info("Starting Charity MCP Server...");
        // Set up error handlers first
        setupErrorHandlers();
        // Initialize server components
        await initializeServer();
        // Set up transport (stdio for local usage)
        const transport = new StdioServerTransport();
        // Connect server to transport
        await server.connect(transport);
        logger.info("Charity MCP Server started successfully");
    }
    catch (error) {
        logger.error("Failed to start server", error);
        process.exit(1);
    }
}
// Initialize server with tools and handlers
async function initializeServer() {
    try {
        // Load configuration
        serverConfig = loadServerConfig();
        // Initialize API client
        await initializeCharityAPIClient();
        // Register tools
        registerCharityTools();
        logger.info("Server initialization completed");
    }
    catch (error) {
        logger.error("Server initialization failed", error);
        throw error;
    }
}
async function initializeCharityAPIClient() {
    try {
        const apiConfig = loadCharityAPIConfig();
        validateConfig(apiConfig);
        charityAPIClient = new CharityAPIClient(apiConfig);
        // Initialize rate limiter (e.g., 100 requests per minute)
        rateLimiter = new RateLimiter(100, 60 * 1000);
        // Set up periodic cleanup
        setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000); // Every 5 minutes
        logger.info('CharityAPI client initialized successfully');
    }
    catch (error) {
        logger.error('Failed to initialize CharityAPI client', error);
        throw error;
    }
}
function registerCharityTools() {
    try {
        // Register all charity-related tools
        registerAllTools(server);
        logger.info("Charity tools registered successfully");
    }
    catch (error) {
        logger.error("Failed to register charity tools", error);
        throw error;
    }
}
// Graceful shutdown handling
process.on('SIGINT', async () => {
    logger.info('Received SIGINT, shutting down gracefully...');
    try {
        // Perform any cleanup here
        process.exit(0);
    }
    catch (error) {
        logger.error('Error during shutdown', error);
        process.exit(1);
    }
});
process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM, shutting down gracefully...');
    try {
        // Perform any cleanup here
        process.exit(0);
    }
    catch (error) {
        logger.error('Error during shutdown', error);
        process.exit(1);
    }
});
// Export for use in tool implementations
export { charityAPIClient, rateLimiter, serverConfig, server };
// Run main if this is the main module
if (import.meta.url === new URL(process.argv[1] || import.meta.url, "file:").href) {
    main().catch((error) => {
        logger.error("Unhandled error in main", error);
        process.exit(1);
    });
}
//# sourceMappingURL=index.js.map