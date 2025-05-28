import { z } from "zod";
// EIN validation schema - must match format XX-XXXXXXX or XXXXXXXXX
export const EINSchema = z.string()
    .min(9, "EIN must be at least 9 characters")
    .max(10, "EIN must be at most 10 characters")
    .refine((ein) => {
    // Remove hyphens and check if it's exactly 9 digits
    const cleanEIN = ein.replace(/-/g, '');
    return /^\d{9}$/.test(cleanEIN);
}, "EIN must be a valid 9-digit number in format XX-XXXXXXX or XXXXXXXXX")
    .transform((ein) => {
    // Normalize EIN format to XX-XXXXXXX
    const cleanEIN = ein.replace(/-/g, '');
    return `${cleanEIN.slice(0, 2)}-${cleanEIN.slice(2)}`;
});
// Charity lookup tool input schema
export const CharityLookupInputSchema = z.object({
    ein: EINSchema,
});
// Public charity check tool input schema
export const PublicCharityCheckInputSchema = z.object({
    ein: EINSchema,
});
// Charity search tool input schema
export const CharitySearchInputSchema = z.object({
    query: z.string()
        .min(1, "Search query cannot be empty")
        .max(200, "Search query cannot exceed 200 characters")
        .optional(),
    city: z.string()
        .min(1, "City name cannot be empty")
        .max(100, "City name cannot exceed 100 characters")
        .optional(),
    state: z.string()
        .length(2, "State must be a 2-letter abbreviation (e.g., CA, NY)")
        .regex(/^[A-Z]{2}$/, "State must be uppercase 2-letter abbreviation")
        .optional(),
    limit: z.number()
        .min(1, "Limit must be at least 1")
        .max(100, "Limit cannot exceed 100")
        .default(25),
    offset: z.number()
        .min(0, "Offset cannot be negative")
        .default(0),
});
// Output schemas for type safety
export const CharityLookupOutputSchema = z.object({
    ein: z.string(),
    name: z.string(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    deductibilityCode: z.string().optional(),
    deductibilityDetail: z.string().optional(),
    status: z.string().optional(),
    classification: z.string().optional(),
    activity: z.string().optional(),
    organization: z.string().optional(),
    ruling: z.string().optional(),
    foundation: z.string().optional(),
});
export const PublicCharityCheckOutputSchema = z.object({
    ein: z.string(),
    isPublicCharity: z.boolean(),
    deductible: z.boolean().optional(),
});
export const CharitySearchOutputSchema = z.object({
    results: z.array(z.object({
        ein: z.string(),
        name: z.string(),
        city: z.string().optional(),
        state: z.string().optional(),
        deductibilityCode: z.string().optional(),
    })),
    pagination: z.object({
        total: z.number(),
        page: z.number(),
        limit: z.number(),
        hasMore: z.boolean(),
    }),
});
//# sourceMappingURL=charity-schemas.js.map