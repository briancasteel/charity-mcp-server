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
    .min(3, "Search query cannot be empty")
    .max(200, "Search query cannot exceed 200 characters")
    .optional(),
  city: z.string()
    .optional()
    .transform((val) => val === "" ? undefined : val)
    .refine((val) => val === undefined || (val.length <= 100), 
      "City name cannot exceed 100 characters"),
  state: z.string()
    .optional()
    .transform((val) => val === "" ? undefined : val)
    .transform((val) => val?.toUpperCase())
    .refine((val) => val === undefined || (val.length === 2 && /^[A-Za-z]{2}$/.test(val)), 
      "State must be a 2-letter abbreviation (e.g., CA, ca, NY, ny)"),
});

// List organizations tool input schema
export const ListOrganizationsInputSchema = z.object({
  since: z.string()
    .refine((dateStr) => {
      const date = new Date(dateStr);
      return !isNaN(date.getTime());
    }, "Since must be a valid ISO date string")
    .transform((dateStr) => new Date(dateStr)),
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
});

export const ListOrganizationsOutputSchema = z.object({
  organizations: z.array(z.object({
    ein: z.string(),
    name: z.string(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    street: z.string().optional(),
    status: z.string().optional(),
    classification: z.string().optional(),
    subsection: z.string().optional(),
    foundation: z.string().optional(),
    activity: z.string().optional(),
    organization: z.string().optional(),
    deductibility: z.string().optional(),
    ruling: z.string().optional(),
    taxPeriod: z.string().optional(),
    revenueAmount: z.string().optional(),
    incomeAmount: z.string().optional(),
    assetAmount: z.string().optional(),
  })),
  since: z.date(),
});

// Type exports for TypeScript
export type CharityLookupInput = z.infer<typeof CharityLookupInputSchema>;
export type PublicCharityCheckInput = z.infer<typeof PublicCharityCheckInputSchema>;
export type CharitySearchInput = z.infer<typeof CharitySearchInputSchema>;
export type ListOrganizationsInput = z.infer<typeof ListOrganizationsInputSchema>;
export type CharityLookupOutput = z.infer<typeof CharityLookupOutputSchema>;
export type PublicCharityCheckOutput = z.infer<typeof PublicCharityCheckOutputSchema>;
export type CharitySearchOutput = z.infer<typeof CharitySearchOutputSchema>;
export type ListOrganizationsOutput = z.infer<typeof ListOrganizationsOutputSchema>;
