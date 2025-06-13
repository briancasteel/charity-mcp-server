import { Prompt, GetPromptResult } from "@modelcontextprotocol/sdk/types.js";

// Verification prompt definitions
export const VERIFICATION_PROMPTS: Prompt[] = [
  {
    name: "charity_verification_guide",
    description: "Complete guide for AI assistants to perform charity legitimacy verification using MCP tools",
    arguments: [
      {
        name: "organization_type",
        description: "Type of verification needed (name_only, ein_based, suspicious, quick_check, location_specific)",
        required: false,
      },
    ],
  },
  {
    name: "basic_legitimacy_workflow",
    description: "Step-by-step workflow for basic charity legitimacy verification",
    arguments: [
      {
        name: "verification_type",
        description: "Type of verification (organization_name, ein_verification, suspicious_org, quick_status, location_specific)",
        required: true,
      },
      {
        name: "organization_name",
        description: "Name of the organization to verify",
        required: false,
      },
      {
        name: "ein",
        description: "EIN number for direct verification",
        required: false,
      },
      {
        name: "location",
        description: "City and state for location-specific searches",
        required: false,
      },
    ],
  },
  {
    name: "red_flag_detection",
    description: "Guidance for detecting and handling charity verification red flags",
    arguments: [
      {
        name: "status_type",
        description: "Type of problematic status (revoked, conditional, suspended)",
        required: false,
      },
    ],
  },
  {
    name: "verification_response_templates",
    description: "Response templates for different charity verification outcomes",
    arguments: [
      {
        name: "outcome_type",
        description: "Type of verification outcome (verified, failed, conditional, not_found)",
        required: true,
      },
    ],
  },
];

export async function handleVerificationPrompt(
  name: string,
  args?: Record<string, unknown>
): Promise<GetPromptResult> {
  switch (name) {
    case "charity_verification_guide":
      return {
        description: "Complete charity verification guide for AI assistants",
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: generateVerificationGuide(args?.organization_type as string),
            },
          },
        ],
      };

    case "basic_legitimacy_workflow":
      return {
        description: "Basic legitimacy verification workflow",
        messages: [
          {
            role: "user", 
            content: {
              type: "text",
              text: generateLegitimacyWorkflow(args),
            },
          },
        ],
      };

    case "red_flag_detection":
      return {
        description: "Red flag detection guidance",
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: generateRedFlagGuidance(args?.status_type as string),
            },
          },
        ],
      };

    case "verification_response_templates":
      return {
        description: "Response templates for verification outcomes",
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: generateResponseTemplate(args?.outcome_type as string),
            },
          },
        ],
      };

    default:
      throw new Error(`Unknown verification prompt: ${name}`);
  }
}

function generateVerificationGuide(organizationType?: string): string {
  const baseGuide = `# Charity Verification Guide for AI Assistants

## Overview
Use the Charity MCP Server's three primary tools for verification:
- **charity_search** - Find organizations by name, location, or keywords
- **charity_lookup** - Get detailed information using an EIN
- **public_charity_check** - Quick verification of public charity status

## Key Principles
1. Always explain what databases you're searching (IRS)
2. Use clear status indicators: ✅ ⚠️ ❌
3. Provide actionable recommendations
4. Clarify scope and limitations

## Verification Process
1. Determine what information the user has provided
2. Select appropriate tool(s) based on available information
3. Execute verification in logical sequence
4. Format response with clear status and recommendations`;

  if (organizationType) {
    return baseGuide + `\n\n## Specific Guidance for: ${organizationType}\n${getSpecificGuidance(organizationType)}`;
  }

  return baseGuide;
}

function generateLegitimacyWorkflow(args?: Record<string, unknown>): string {
  const verificationType = args?.verification_type as string;
  const organizationName = args?.organization_name as string;
  const ein = args?.ein as string;
  const location = args?.location as string;

  switch (verificationType) {
    case "organization_name":
      return `# Organization Name Verification Workflow

**Step 1: Search for the organization**
\`\`\`
Tool: charity_search
Input: {"query": "${organizationName || '[organization name]'}"}
\`\`\`

**Step 2: If found, get detailed verification**
\`\`\`
Tool: charity_lookup
Input: {"ein": "[ein_from_search_results]"}
\`\`\`

**Response Format:**
✅ VERIFIED LEGITIMATE CHARITY
- Official Name: [name]
- EIN: [ein]
- Status: [status description]
- Ruling Date: [date established]
- Tax-Deductible: [yes/no]
- Location: [address]
- Current IRS Status: [in good standing/issues]`;

    case "ein_verification":
      return `# EIN-Based Verification Workflow

**Direct lookup (single step):**
\`\`\`
Tool: charity_lookup
Input: {"ein": "${ein || '[XX-XXXXXXX]'}"}
\`\`\`

**Response Format:**
✅ VERIFIED LEGITIMATE CHARITY
- Official Name: [name]
- EIN: [ein]
- Status: Active 501(c)(3) organization
- Ruling Date: [date]
- Tax-Deductible: Yes
- Location: [city, state]
- Current Status: In good standing with IRS`;

    case "quick_status":
      return `# Quick Status Check Workflow

**Quick verification:**
\`\`\`
Tool: public_charity_check
Input: {"ein": "${ein || '[XX-XXXXXXX]'}"}
\`\`\`

**Response Format:**
✅ PUBLIC CHARITY VERIFIED
- EIN [XX-XXXXXXX] is a legitimate public charity
- Donations are tax-deductible
- Status: Active`;

    case "location_specific":
      return `# Location-Specific Verification Workflow

**Location-specific search:**
\`\`\`
Tool: charity_search
Input: {
  "query": "${organizationName || '[organization name]'}",
  "city": "[city]",
  "state": "[state]"
}
\`\`\`

Then follow up with charity_lookup for full verification.
${location ? `\nSearching in: ${location}` : ''}`;

    case "suspicious_org":
      return `# Suspicious Organization Verification Workflow

**Step 1: Search for organization**
\`\`\`
Tool: charity_search
Input: {"query": "${organizationName || '[organization name]'}"}
\`\`\`

**Possible Outcomes:**

**A) No Results:**
⚠️ NO MATCH FOUND
- No organization named '${organizationName || '[name]'}' found in IRS database
- This may indicate:
  • Not a registered 501(c)(3) organization
  • Different official name used with IRS
  • Recently registered (database may not be updated)
- Recommendation: Request EIN or official legal name

**B) Multiple Generic Matches:**
⚠️ MULTIPLE ORGANIZATIONS FOUND
- Found [X] organizations with similar names
- Need more specific information:
  • City/State location
  • EIN number
  • Full official name
- Cannot verify without additional details

**C) Single Clear Match:**
Proceed to Step 2 for full verification`;

    default:
      return "Please specify a verification_type: organization_name, ein_verification, quick_status, location_specific, or suspicious_org";
  }
}

function generateRedFlagGuidance(statusType?: string): string {
  const baseGuidance = `# Red Flag Detection in Charity Verification

## Common Red Flags:
- **Revoked Status** - Tax-exempt status removed by IRS
- **Conditional Status** - Compliance issues with IRS
- **Suspended Status** - Temporary suspension of operations
- **No Registration** - Not found in IRS database

## Response Protocols:`;

  const statusGuidance = {
    revoked: `
**Revoked Status Response:**
❌ VERIFICATION FAILED
- Organization found but status shows: 'Revoked'
- Tax-exempt status was revoked in [year]
- Donations are NOT tax-deductible
- Recommendation: Do not donate to this organization`,

    conditional: `
**Conditional Status Response:**
⚠️ CONDITIONAL STATUS
- Organization has conditional tax-exempt status
- May have compliance issues with IRS
- Recommendation: Contact organization directly or consult tax advisor`,

    suspended: `
**Suspended Status Response:**
⚠️ SUSPENDED STATUS
- Organization operations are temporarily suspended
- Tax-exempt status may be under review
- Recommendation: Verify current status before donating`,
  };

  if (statusType && statusGuidance[statusType as keyof typeof statusGuidance]) {
    return baseGuidance + statusGuidance[statusType as keyof typeof statusGuidance];
  }

  return baseGuidance + Object.values(statusGuidance).join('\n');
}

function generateResponseTemplate(outcomeType: string): string {
  const templates = {
    verified: `✅ VERIFIED LEGITIMATE CHARITY
- Official Name: [name]
- EIN: [ein]
- Status: Active 501(c)(3) organization
- Ruling Date: [date]
- Tax-Deductible: Yes
- Location: [city, state]
- Current IRS Status: In good standing`,

    failed: `❌ VERIFICATION FAILED
- Organization found but status shows: '[status]'
- Tax-exempt status was [action] in [year]
- Donations are NOT tax-deductible
- Recommendation: Do not donate to this organization`,

    conditional: `⚠️ CONDITIONAL STATUS
- Organization has conditional tax-exempt status
- May have compliance issues with IRS
- Recommendation: Contact organization directly or consult tax advisor`,

    not_found: `⚠️ NO MATCH FOUND
- No organization named '[name]' found in IRS database
- This may indicate:
  • Not a registered 501(c)(3) organization
  • Different official name used with IRS
  • Recently registered (database may not be updated)
- Recommendation: Request official EIN number`,
  };

  return templates[outcomeType as keyof typeof templates] || 
    "Please specify outcome_type: verified, failed, conditional, or not_found";
}

function getSpecificGuidance(organizationType: string): string {
  const guidance = {
    name_only: "When user provides only organization name, always start with charity_search then follow up with charity_lookup for complete verification.",
    ein_based: "When user provides EIN, use charity_lookup directly for comprehensive verification.",
    suspicious: "For suspicious organizations, be extra thorough in verification and clearly communicate any red flags found.",
    quick_check: "Use public_charity_check for fast yes/no verification when user needs immediate confirmation.",
    location_specific: "Include city and state parameters in charity_search when location is mentioned by user.",
  };

  return guidance[organizationType as keyof typeof guidance] || "Standard verification procedures apply.";
}
