import { z } from "zod";
export declare const EINSchema: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
export declare const CharityLookupInputSchema: z.ZodObject<{
    ein: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
}, "strip", z.ZodTypeAny, {
    ein: string;
}, {
    ein: string;
}>;
export declare const PublicCharityCheckInputSchema: z.ZodObject<{
    ein: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
}, "strip", z.ZodTypeAny, {
    ein: string;
}, {
    ein: string;
}>;
export declare const CharitySearchInputSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    query?: string | undefined;
    city?: string | undefined;
    state?: string | undefined;
}, {
    query?: string | undefined;
    city?: string | undefined;
    state?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}>;
export declare const CharityLookupOutputSchema: z.ZodObject<{
    ein: z.ZodString;
    name: z.ZodString;
    city: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    deductibilityCode: z.ZodOptional<z.ZodString>;
    deductibilityDetail: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
    classification: z.ZodOptional<z.ZodString>;
    activity: z.ZodOptional<z.ZodString>;
    organization: z.ZodOptional<z.ZodString>;
    ruling: z.ZodOptional<z.ZodString>;
    foundation: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    ein: string;
    name: string;
    status?: string | undefined;
    city?: string | undefined;
    state?: string | undefined;
    country?: string | undefined;
    deductibilityCode?: string | undefined;
    deductibilityDetail?: string | undefined;
    classification?: string | undefined;
    activity?: string | undefined;
    organization?: string | undefined;
    ruling?: string | undefined;
    foundation?: string | undefined;
}, {
    ein: string;
    name: string;
    status?: string | undefined;
    city?: string | undefined;
    state?: string | undefined;
    country?: string | undefined;
    deductibilityCode?: string | undefined;
    deductibilityDetail?: string | undefined;
    classification?: string | undefined;
    activity?: string | undefined;
    organization?: string | undefined;
    ruling?: string | undefined;
    foundation?: string | undefined;
}>;
export declare const PublicCharityCheckOutputSchema: z.ZodObject<{
    ein: z.ZodString;
    isPublicCharity: z.ZodBoolean;
    deductible: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    ein: string;
    isPublicCharity: boolean;
    deductible?: boolean | undefined;
}, {
    ein: string;
    isPublicCharity: boolean;
    deductible?: boolean | undefined;
}>;
export declare const CharitySearchOutputSchema: z.ZodObject<{
    results: z.ZodArray<z.ZodObject<{
        ein: z.ZodString;
        name: z.ZodString;
        city: z.ZodOptional<z.ZodString>;
        state: z.ZodOptional<z.ZodString>;
        deductibilityCode: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ein: string;
        name: string;
        city?: string | undefined;
        state?: string | undefined;
        deductibilityCode?: string | undefined;
    }, {
        ein: string;
        name: string;
        city?: string | undefined;
        state?: string | undefined;
        deductibilityCode?: string | undefined;
    }>, "many">;
    pagination: z.ZodObject<{
        total: z.ZodNumber;
        page: z.ZodNumber;
        limit: z.ZodNumber;
        hasMore: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        limit: number;
        total: number;
        page: number;
        hasMore: boolean;
    }, {
        limit: number;
        total: number;
        page: number;
        hasMore: boolean;
    }>;
}, "strip", z.ZodTypeAny, {
    results: {
        ein: string;
        name: string;
        city?: string | undefined;
        state?: string | undefined;
        deductibilityCode?: string | undefined;
    }[];
    pagination: {
        limit: number;
        total: number;
        page: number;
        hasMore: boolean;
    };
}, {
    results: {
        ein: string;
        name: string;
        city?: string | undefined;
        state?: string | undefined;
        deductibilityCode?: string | undefined;
    }[];
    pagination: {
        limit: number;
        total: number;
        page: number;
        hasMore: boolean;
    };
}>;
export type CharityLookupInput = z.infer<typeof CharityLookupInputSchema>;
export type PublicCharityCheckInput = z.infer<typeof PublicCharityCheckInputSchema>;
export type CharitySearchInput = z.infer<typeof CharitySearchInputSchema>;
export type CharityLookupOutput = z.infer<typeof CharityLookupOutputSchema>;
export type PublicCharityCheckOutput = z.infer<typeof PublicCharityCheckOutputSchema>;
export type CharitySearchOutput = z.infer<typeof CharitySearchOutputSchema>;
//# sourceMappingURL=charity-schemas.d.ts.map