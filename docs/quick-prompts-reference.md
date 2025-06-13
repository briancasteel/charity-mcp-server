# Quick Prompts Reference - Basic Charity Verification

Quick reference guide for AI assistants using the Charity MCP Server for basic legitimacy verification.

## Quick Prompt Templates

### User Has Organization Name
```
User: "Is [organization name] a real charity?"

1. charity_search: {"query": "[organization name]"}
2. charity_lookup: {"ein": "[ein_from_results]"}
3. Format: ✅ VERIFIED or ⚠️ NO MATCH FOUND
```

### User Has EIN
```
User: "Verify EIN [XX-XXXXXXX]"

1. charity_lookup: {"ein": "[XX-XXXXXXX]"}  
2. Format: ✅ VERIFIED LEGITIMATE CHARITY
```

### Quick Yes/No Check
```
User: "Is EIN [XX-XXXXXXX] legitimate?"

1. public_charity_check: {"ein": "[XX-XXXXXXX]"}
2. Format: ✅ PUBLIC CHARITY VERIFIED
```

## Response Templates

### ✅ Verified Legitimate
```
✅ VERIFIED LEGITIMATE CHARITY
- Official Name: [name]
- EIN: [ein]
- Status: Active 501(c)(3) organization
- Tax-Deductible: Yes
- Location: [city, state]
- Current IRS Status: In good standing
```

### ⚠️ Cannot Verify
```
⚠️ NO MATCH FOUND
- No organization named '[name]' found in IRS database
- May not be registered 501(c)(3) organization
- Recommendation: Request official EIN number
```

### ❌ Problems Found
```
❌ VERIFICATION FAILED
- Organization status shows: 'Revoked'
- Tax-exempt status revoked in [year]
- Donations are NOT tax-deductible
- Recommendation: Do not donate
```

## Common Keywords That Trigger Verification

- "Is [org] a real charity?"
- "Verify [org] legitimacy"
- "Check if [org] is registered"
- "Is [org] tax-deductible?"
- "Can I trust [org]?"
- "Is [org] a scam?"
- "Lookup EIN [number]"
- "Verify charity status"

## Tool Selection Logic

| User Intent | Tool to Use | When |
|-------------|-------------|------|
| Has organization name only | `charity_search` → `charity_lookup` | Always start with search |
| Has EIN number | `charity_lookup` | Direct verification |
| Wants quick yes/no | `public_charity_check` | Fast verification only |
| Location specific | `charity_search` with city/state | When location mentioned |

## Red Flags to Watch For

- Status: "Revoked" → ❌ Do not donate
- Status: "Conditional" → ⚠️ Caution advised  
- No search results → ⚠️ Not registered
- Multiple similar names → ⚠️ Need clarification

## AI Assistant Best Practices

1. **Always explain scope**: "I'm checking IRS registration status..."
2. **Use clear indicators**: ✅ ⚠️ ❌
3. **Provide recommendations**: "I recommend..." or "Do not donate"
4. **Mention limitations**: "Recent registrations may not appear"
5. **Ask for EIN when unclear**: "Can you provide their EIN number?"
