import { McpError } from "@modelcontextprotocol/sdk/types.js";
export declare class CharityAPIError extends Error {
    statusCode?: number | undefined;
    originalError?: Error | undefined;
    constructor(message: string, statusCode?: number | undefined, originalError?: Error | undefined);
}
export declare class ValidationError extends Error {
    field?: string | undefined;
    constructor(message: string, field?: string | undefined);
}
export declare function handleMCPError(error: unknown): McpError;
export declare function setupErrorHandlers(): void;
//# sourceMappingURL=error-handler.d.ts.map