import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
export declare const CHARITY_LOOKUP_TOOL: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            ein: {
                type: string;
                description: string;
                pattern: string;
            };
        };
        required: string[];
    };
};
export declare function handleCharityLookup(args: unknown): Promise<CallToolResult>;
//# sourceMappingURL=charity-lookup.d.ts.map