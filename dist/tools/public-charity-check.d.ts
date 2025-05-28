import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
export declare const PUBLIC_CHARITY_CHECK_TOOL: {
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
export declare function handlePublicCharityCheck(args: unknown): Promise<CallToolResult>;
//# sourceMappingURL=public-charity-check.d.ts.map