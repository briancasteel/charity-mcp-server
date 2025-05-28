#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { loadServerConfig } from './config/index.js';
import { CharityAPIClient } from './services/charity-api.js';
import { RateLimiter } from './services/rate-limiter.js';
declare let charityAPIClient: CharityAPIClient;
declare let rateLimiter: RateLimiter;
declare let serverConfig: ReturnType<typeof loadServerConfig>;
declare const server: Server<{
    method: string;
    params?: {
        [x: string]: unknown;
        _meta?: {
            [x: string]: unknown;
            progressToken?: string | number | undefined;
        } | undefined;
    } | undefined;
}, {
    method: string;
    params?: {
        [x: string]: unknown;
        _meta?: {
            [x: string]: unknown;
        } | undefined;
    } | undefined;
}, {
    [x: string]: unknown;
    _meta?: {
        [x: string]: unknown;
    } | undefined;
}>;
export { charityAPIClient, rateLimiter, serverConfig, server };
//# sourceMappingURL=index.d.ts.map