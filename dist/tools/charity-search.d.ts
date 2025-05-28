import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
export declare const CHARITY_SEARCH_TOOL: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            query: {
                type: string;
                description: string;
                maxLength: number;
            };
            city: {
                type: string;
                description: string;
                maxLength: number;
            };
            state: {
                type: string;
                description: string;
                pattern: string;
            };
            limit: {
                type: string;
                description: string;
                minimum: number;
                maximum: number;
                default: number;
            };
            offset: {
                type: string;
                description: string;
                minimum: number;
                default: number;
            };
        };
        required: never[];
    };
};
export declare function handleCharitySearch(args: unknown): Promise<CallToolResult>;
//# sourceMappingURL=charity-search.d.ts.map