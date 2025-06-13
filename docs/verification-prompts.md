# Charity Verification Prompts Guide

This guide provides AI assistants with example prompts and workflows for using the Charity MCP Server to perform basic legitimacy verification of nonprofit organizations.

## Overview

The Charity MCP Server provides three primary tools for verification:
- **`charity_search`** - Find organizations by name, location, or keywords
- **`charity_lookup`** - Get detailed information using an EIN
- **`public_charity_check`** - Quick verification of public charity status

## Basic Legitimacy Verification Prompts

### 1. Organization Name Only

**User Prompts:**
- "Is [organization name] a real charity registered with the IRS?"
- "Verify that [organization name] is a legitimate nonprofit"
- "Check if [organization name] is actually registered with the IRS"
- "Is [organization name] a real charity or a scam?"

**Workflow:**

```
Step 1: Search for the organization
Tool: charity_search
Input: {"query": "[organization name]"}

Step 2: If found, get detailed verification
Tool: charity_lookup
Input: {"ein": "[ein_from_search_results]"}

Response Format:
✅ VERIFIED LEGITIMATE CHARITY
- Official Name: [name]
- EIN: [ein]
- Status: [status description]
- Ruling Date: [date established]
- Tax-Deductible: [yes/no]
- Location: [address]
- Current IRS Status: [in good standing/issues]
```

### 2. EIN-Based Verification

**User Prompts:**
- "Verify that organization with EIN [XX-XXXXXXX] is legitimate"
- "Check the legitimacy of EIN [XX-XXXXXXX]"
- "Is EIN [XX-XXXXXXX] a real registered charity?"
- "Lookup organization details for EIN [XX-XXXXXXX]"

**Workflow:**

```
Direct lookup (single step):
Tool: charity_lookup
Input: {"ein": "[XX-XXXXXXX]"}

Response Format:
✅ VERIFIED LEGITIMATE CHARITY
- Official Name: [name]
- EIN: [ein]
- Status: Active 501(c)(3) organization
- Ruling Date: [date]
- Tax-Deductible: Yes
- Location: [city, state]
- Current Status: In good standing with IRS
```

### 3. Suspicious/Unknown Organizations

**User Prompts:**
- "Is '[generic charity name]' a real charity?"
- "I got a donation request from '[organization]' - are they legitimate?"
- "Someone is collecting money for '[cause]' - is this a real charity?"
- "Verify this charity that contacted me: [organization name]"

**Workflow:**

```
Step 1: Search for organization
Tool: charity_search
Input: {"query": "[organization name]"}

Possible Outcomes:

A) No Results:
⚠️ NO MATCH FOUND
- No organization named '[name]' found in IRS database
- This may indicate:
  • Not a registered 501(c)(3) organization
  • Different official name used with IRS
  • Recently registered (database may not be updated)
- Recommendation: Request EIN or official legal name

B) Multiple Generic Matches:
⚠️ MULTIPLE ORGANIZATIONS FOUND
- Found [X] organizations with similar names
- Need more specific information:
  • City/State location
  • EIN number
  • Full official name
- Cannot verify without additional details

C) Single Clear Match:
Proceed to Step 2 for full verification
```

### 4. Quick Status Check

**User Prompts:**
- "Quick check: is EIN [XX-XXXXXXX] a legitimate public charity?"
- "Fast verification needed for [organization] with EIN [XX-XXXXXXX]"
- "Just tell me if EIN [XX-XXXXXXX] is tax-deductible"
- "Simple yes/no: is [organization] a real charity?"

**Workflow:**

```
Quick verification:
Tool: public_charity_check
Input: {"ein": "[XX-XXXXXXX]"}

Response Format:
✅ PUBLIC CHARITY VERIFIED
- EIN [XX-XXXXXXX] is a legitimate public charity
- Donations are tax-deductible
- Status: Active
```

### 5. Location-Specific Verification

**User Prompts:**
- "Is there a legitimate charity called '[name]' in [city, state]?"
- "Verify '[organization]' operating in [location]"
- "Check if '[charity name]' in [city] is real"
- "Find the real charity named '[name]' in [state]"

**Workflow:**

```
Location-specific search:
Tool: charity_search
Input: {
  "query": "[organization name]",
  "city": "[city]",
  "state": "[state]"
}

Then follow up with charity_lookup for full verification
```

## Red Flag Detection

When verification reveals problems:

**Revoked Status:**
```
❌ VERIFICATION FAILED
- Organization found but status shows: 'Revoked'
- Tax-exempt status was revoked in [year]
- Donations are NOT tax-deductible
- Recommendation: Do not donate to this organization
```

**Conditional/Suspended Status:**
```
⚠️ CONDITIONAL STATUS
- Organization has conditional tax-exempt status
- May have compliance issues with IRS
- Recommendation: Contact organization directly or consult tax advisor
```

## Best Practices for AI Assistants

### 1. Always Provide Context
- Explain what databases are being searched (IRS)
- Clarify the scope of verification (tax-exempt status, not operational legitimacy)
- Mention limitations (recent registrations may not appear)

### 2. Use Clear Status Indicators
- ✅ for verified legitimate charities
- ⚠️ for unclear or conditional situations
- ❌ for revoked or problematic organizations

### 3. Provide Actionable Recommendations
- For unverified organizations: "Request official EIN"
- For revoked status: "Do not donate"
- For conditional status: "Consult tax advisor"

### 4. Handle Edge Cases
- Multiple organizations with same name
- Recently registered organizations
- Organizations with name changes
- Dissolved or merged organizations

## Example Conversations

### Successful Verification
```
User: "Is the American Cancer Society a real charity?"

AI: Let me search for "American Cancer Society" in the IRS database...

[Uses charity_search tool]

AI: I found the organization. Now let me get the full verification details...

[Uses charity_lookup tool with EIN 13-1788491]

AI: ✅ VERIFIED LEGITIMATE CHARITY
- Official Name: American Cancer Society Inc
- EIN: 13-1788491
- Status: Active 501(c)(3) organization
- Ruling Date: 1944 (established over 80 years ago)
- Tax-Deductible: Yes
- Location: Atlanta, GA
- Current IRS Status: In good standing

The American Cancer Society is a well-established, legitimate charity registered with the IRS since 1944. Donations to this organization are tax-deductible.
```

### Failed Verification
```
User: "Is 'Help Kids Now Foundation' a real charity?"

AI: Let me search for "Help Kids Now Foundation" in the IRS database...

[Uses charity_search tool]

AI: ⚠️ NO MATCH FOUND
- No organization named "Help Kids Now Foundation" found in IRS database
- This may indicate:
  • Not a registered 501(c)(3) organization
  • Different official name used with IRS
  • Recently registered (database may not be updated)
- Recommendation: Request their official EIN number or full legal name for proper verification

I cannot verify this organization's legitimacy based on the name provided. Before donating, I'd recommend asking them for their official EIN (Tax ID number) so I can perform a proper verification.
```

### Quick Verification
```
User: "Quick check: is EIN 52-1693387 legitimate?"

AI: Let me quickly verify EIN 52-1693387...

[Uses public_charity_check tool]

AI: ✅ PUBLIC CHARITY VERIFIED
- EIN 52-1693387 is a legitimate public charity
- Donations are tax-deductible
- Status: Active

This EIN belongs to a verified public charity in good standing with the IRS.
```

### Red Flag Detection
```
User: "Check if EIN 12-3456789 is a real charity"

AI: Let me lookup EIN 12-3456789...

[Uses charity_lookup tool]

AI: ❌ VERIFICATION FAILED
- Organization found but status shows: 'Revoked'
- Tax-exempt status was revoked in 2019
- Donations are NOT tax-deductible
- Recommendation: Do not donate to this organization

This organization previously had tax-exempt status but it was revoked by the IRS in 2019. Any donations made to this organization would not be tax-deductible, and I would not recommend donating to them.
```

## Common Verification Scenarios

### 1. Disaster Relief Verification
```
User: "There's a Hurricane Relief Fund collecting donations - EIN 12-3456789. Is it legitimate?"

Process:
1. Use charity_lookup with provided EIN
2. Verify 501(c)(3) status and current standing
3. Check if organization actually does disaster relief work
4. Provide clear recommendation
```

### 2. Corporate Donation Verification
```
User: "Our company wants to donate to several charities. Can you verify these EINs: 13-1837418, 52-1693387, 11-1234567?"

Process:
1. Use charity_lookup for each EIN individually
2. Provide verification status for each
3. Summary table of all organizations
4. Flag any issues or concerns
```

### 3. Estate Planning Verification
```
User: "I'm updating my will and want to leave money to St. Jude Children's Research Hospital. Verify they're legitimate."

Process:
1. Search for "St. Jude Children's Research Hospital"
2. Full charity_lookup verification
3. Confirm public charity status for estate planning purposes
4. Provide detailed verification suitable for legal documentation
```

## Integration Notes

This prompts guide is designed to work with the Charity MCP Server's existing tools:
- All EIN formats are automatically validated by the server
- Rate limiting is handled transparently
- Error handling provides user-friendly messages
- Responses are formatted for optimal AI assistant presentation

For implementation, AI assistants should:
1. Parse user intent to determine verification type needed
2. Select appropriate tool(s) from the MCP server
3. Format responses using the templates provided
4. Always provide clear recommendations and next steps
