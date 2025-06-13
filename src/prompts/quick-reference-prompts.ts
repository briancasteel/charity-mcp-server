import { Prompt, GetPromptResult } from "@modelcontextprotocol/sdk/types.js";

// Quick reference prompt definitions
export const QUICK_REFERENCE_PROMPTS: Prompt[] = [
  {
    name: "quick_verification_reference",
    description: "Quick reference guide for basic charity verification workflows",
    arguments: [
      {
        name: "user_input_type",
        description: "Type of user input (organization_name, ein, quick_check, location_specific)",
        required: false,
      },
    ],
  },
  {
    name: "response_templates_quick",
    description: "Quick response templates for common verification scenarios",
    arguments: [
      {
        name: "template_type",
        description: "Type of response template (verified, cannot_verify, problems_found)",
        required: false,
      },
    ],
  },
  {
    name: "tool_selection_guide",
    description: "Quick guide for selecting the right MCP tool based on user intent",
    arguments: [
      {
        name: "scenario",
        description: "Verification scenario to get tool selection guidance for",
        required: false,
      },
    ],
  },
  {
    name: "common_keywords_reference",
    description: "Reference of common keywords that trigger charity verification",
    arguments: [],
  },
  {
    name: "ai_assistant_best_practices",
    description: "Best practices for AI assistants using the charity verification system",
    arguments: [],
  },
];

export async function handleQuickReferencePrompt(
  name: string,
  args?: Record<string, unknown>
): Promise<GetPromptResult> {
  switch (name) {
    case "quick_verification_reference":
      return {
        description: "Quick verification reference guide",
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: generateQuickReference(args?.user_input_type as string),
            },
          },
        ],
      };

    case "response_templates_quick":
      return {
        description: "Quick response templates",
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: generateQuickTemplates(args?.template_type as string),
            },
          },
        ],
      };

    case "tool_selection_guide":
      return {
        description: "Tool selection guidance",
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: generateToolSelectionGuide(args?.scenario as string),
            },
          },
        ],
      };

    case "common_keywords_reference":
      return {
        description: "Common verification keywords reference",
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: generateKeywordsReference(),
            },
          },
        ],
      };

    case "ai_assistant_best_practices":
      return {
        description: "AI assistant best practices",
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: generateBestPractices(),
            },
          },
        ],
      };

    default:
      throw new Error(`Unknown quick reference prompt: ${name}`);
  }
}

function generateQuickReference(userInputType?: string): string {
  const baseReference = `# Quick Charity Verification Reference

## Quick Workflow Templates

### User Has Organization Name
\`\`\`
User: "Is [organization name] a real charity?"

1. charity_search: {"query": "[organization name]"}
2. charity_lookup: {"ein": "[ein_from_results]"}
3. Format: ✅ VERIFIED or ⚠️ NO MATCH FOUND
\`\`\`

### User Has EIN
\`\`\`
User: "Verify EIN [XX-XXXXXXX]"

1. charity_lookup: {"ein": "[XX-XXXXXXX]"}  
2. Format: ✅ VERIFIED LEGITIMATE CHARITY
\`\`\`

### Quick Yes/No Check
\`\`\`
User: "Is EIN [XX-XXXXXXX] legitimate?"

1. public_charity_check: {"ein": "[XX-XXXXXXX]"}
2. Format: ✅ PUBLIC CHARITY VERIFIED
\`\`\``;

  if (userInputType) {
    return baseReference + `\n\n## Specific Guidance for: ${userInputType}\n${getInputTypeGuidance(userInputType)}`;
  }

  return baseReference;
}

function generateQuickTemplates(templateType?: string): string {
  const templates = {
    verified: `# ✅ Verified Legitimate Template
\`\`\`
✅ VERIFIED LEGITIMATE CHARITY
- Official Name: [name]
- EIN: [ein]
- Status: Active 501(c)(3) organization
- Tax-Deductible: Yes
- Location: [city, state]
- Current IRS Status: In good standing
\`\`\``,

    cannot_verify: `# ⚠️ Cannot Verify Template
\`\`\`
⚠️ NO MATCH FOUND
- No organization named '[name]' found in IRS database
- May not be registered 501(c)(3) organization
- Recommendation: Request official EIN number
\`\`\``,

    problems_found: `# ❌ Problems Found Template
\`\`\`
❌ VERIFICATION FAILED
- Organization status shows: 'Revoked'
- Tax-exempt status revoked in [year]
- Donations are NOT tax-deductible
- Recommendation: Do not donate
\`\`\``,
  };

  if (templateType && templates[templateType as keyof typeof templates]) {
    return templates[templateType as keyof typeof templates];
  }

  return `# Quick Response Templates\n\n${Object.values(templates).join('\n\n')}`;
}

function generateToolSelectionGuide(scenario?: string): string {
  const baseGuide = `# Tool Selection Guide

| User Intent | Tool to Use | When |
|-------------|-------------|------|
| Has organization name only | \`charity_search\` → \`charity_lookup\` | Always start with search |
| Has EIN number | \`charity_lookup\` | Direct verification |
| Wants quick yes/no | \`public_charity_check\` | Fast verification only |
| Location specific | \`charity_search\` with city/state | When location mentioned |

## Decision Tree
1. **Does user have EIN?** 
   - Yes → Use \`charity_lookup\`
   - No → Continue to step 2

2. **Does user want quick verification?**
   - Yes → Use \`public_charity_check\` (if EIN available)
   - No → Continue to step 3

3. **Does user have organization name?**
   - Yes → Use \`charity_search\` then \`charity_lookup\`
   - No → Ask for more information`;

  if (scenario) {
    return baseGuide + `\n\n## Scenario-Specific Guidance: ${scenario}\n${getScenarioGuidance(scenario)}`;
  }

  return baseGuide;
}

function generateKeywordsReference(): string {
  return `# Common Keywords That Trigger Verification

## Direct Verification Requests
- "Is [org] a real charity?"
- "Verify [org] legitimacy"
- "Check if [org] is registered"
- "Is [org] tax-deductible?"
- "Can I trust [org]?"
- "Is [org] a scam?"
- "Lookup EIN [number]"
- "Verify charity status"

## Suspicious/Cautious Language
- "I got a donation request from..."
- "Someone is collecting money for..."
- "This charity contacted me..."
- "Is this legitimate?"
- "Are they real?"

## Quick Check Language
- "Quick check"
- "Fast verification"
- "Simple yes/no"
- "Just tell me if..."

## Location-Specific Language
- "charity in [city]"
- "operating in [location]"
- "based in [state]"
- "local charity"

## EIN-Specific Language
- "EIN [number]"
- "Tax ID [number]"
- "Federal ID"
- "Organization number"

## Intent Recognition Tips
- **Urgent tone** → Use quick verification tools
- **Suspicious language** → Be thorough, check for red flags
- **Location mentioned** → Include location in search
- **EIN provided** → Skip search, go directly to lookup`;
}

function generateBestPractices(): string {
  return `# AI Assistant Best Practices for Charity Verification

## 1. Always Provide Context
- Explain what databases are being searched (IRS)
- Clarify the scope of verification (tax-exempt status, not operational legitimacy)
- Mention limitations (recent registrations may not appear)

## 2. Use Clear Status Indicators
- ✅ for verified legitimate charities
- ⚠️ for unclear or conditional situations
- ❌ for revoked or problematic organizations

## 3. Provide Actionable Recommendations
- For unverified organizations: "Request official EIN"
- For revoked status: "Do not donate"
- For conditional status: "Consult tax advisor"

## 4. Handle Edge Cases
- Multiple organizations with same name
- Recently registered organizations
- Organizations with name changes
- Dissolved or merged organizations

## 5. Communication Best Practices
- Be clear and direct
- Avoid technical jargon
- Explain what each verification step does
- Always end with a clear recommendation

## 6. Red Flag Protocols
- **Immediately flag revoked status**
- **Warn about conditional status**
- **Explain when no match is found**
- **Provide alternative verification steps**

## 7. User Experience Guidelines
- Respond quickly to simple requests
- Provide detailed explanations for complex cases
- Offer to search by different criteria if first attempt fails
- Always explain the significance of findings

## 8. Error Handling
- If API fails, explain what happened
- Offer alternative approaches
- Don't make assumptions about legitimacy
- Always err on the side of caution

## 9. Follow-up Actions
- Suggest contacting organization directly when appropriate
- Recommend checking GuideStar or other charity rating sites
- Advise consulting tax professionals for complex situations
- Provide links to official IRS resources when helpful

## 10. Scope Limitations
- Explain that verification covers IRS registration only
- Clarify that operational legitimacy requires additional research
- Mention that recent changes may not be reflected
- Note that state-level registration may differ from federal`;
}

function getInputTypeGuidance(inputType: string): string {
  const guidance = {
    organization_name: `When user provides organization name:
1. Start with charity_search using the exact name provided
2. If multiple results, ask for location to narrow down
3. If no results, suggest variations or ask for EIN
4. Always follow up successful search with charity_lookup`,

    ein: `When user provides EIN:
1. Use charity_lookup directly - no need to search first
2. Validate EIN format before making the call
3. Provide comprehensive verification results
4. Include tax-deductible status and current standing`,

    quick_check: `For quick verification requests:
1. Use public_charity_check if EIN is available
2. Provide simple yes/no answer with key details
3. Keep response concise but informative
4. Still include recommendation if issues found`,

    location_specific: `For location-specific requests:
1. Include city and state in charity_search parameters
2. Mention geographic scope in response
3. If no local match found, suggest broader search
4. Consider common name variations for local organizations`,
  };

  return guidance[inputType as keyof typeof guidance] || "Standard verification procedures apply.";
}

function getScenarioGuidance(scenario: string): string {
  const scenarios = {
    disaster_relief: `For disaster relief verification:
1. Be extra thorough due to common fraud in this area
2. Verify organization actually does disaster relief work
3. Check for recent registration (red flag for new disaster charities)
4. Provide clear recommendation with emphasis on legitimacy`,

    corporate_donation: `For corporate donation verification:
1. Process multiple EINs systematically
2. Provide summary table of all organizations
3. Flag any issues clearly for decision-makers
4. Include tax-deductible confirmation for each`,

    estate_planning: `For estate planning verification:
1. Provide detailed verification suitable for legal documentation
2. Confirm public charity status specifically
3. Include full organizational details
4. Mention any potential issues that could affect bequests`,

    suspicious_request: `For suspicious requests:
1. Be extra thorough in verification process
2. Check for common red flags (recent registration, similar names)
3. Provide clear warning if issues found
4. Suggest alternative ways to verify legitimacy`,
  };

  return scenarios[scenario as keyof typeof scenarios] || "Apply standard verification procedures with attention to specific context.";
}
