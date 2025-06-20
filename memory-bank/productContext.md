# Product Context: Charity MCP Server

## Why This Project Exists

### Problem Statement
AI assistants lack reliable access to authoritative charity and nonprofit data, making it difficult to:
- Verify legitimate charitable organizations
- Confirm tax-deductible donation status
- Look up official organization details for due diligence
- Search for specific charities by name or location
- Provide accurate charitable giving advice

### Market Gap
- IRS charity data exists but requires complex API integration
- No standardized way for AI tools to access nonprofit information
- Existing solutions are fragmented or require custom integrations
- Need for real-time, authoritative charity verification

## Problems This Solves

### For AI Assistants
- **Verification**: "Is [organization] a legitimate charity?"
- **Due Diligence**: "What's the official name and details for EIN 13-1837418?"
- **Discovery**: "Find Red Cross chapters in California"
- **Tax Planning**: "Can I deduct donations to this organization?"

### For Users
- **Trust**: Access to official IRS data ensures accuracy
- **Convenience**: One-stop charity information lookup
- **Transparency**: Complete organizational details and status
- **Efficiency**: Fast searches without manual IRS database navigation

### For Developers
- **Standardization**: MCP protocol ensures compatibility
- **Reliability**: Enterprise-grade error handling and rate limiting
- **Flexibility**: Multiple search and lookup methods
- **Integration**: Drop-in compatibility with MCP-enabled applications

## How It Should Work

### User Experience Flow
1. **Natural Query**: User asks AI about a charity
2. **Tool Selection**: AI determines appropriate charity tool to use
3. **Data Retrieval**: Server fetches real-time data from IRS via CharityAPI
4. **Response**: User receives accurate, formatted charity information

### Key Interactions
```
User: "Is the American Red Cross tax-deductible?"
AI → charity_lookup(ein: "53-0196605")
Server → CharityAPI → IRS Database
Response: "Yes, American Red Cross is a 501(c)(3) public charity..."

User: "Find animal shelters in Austin, Texas"
AI → charity_search(query: "animal shelter", city: "Austin", state: "TX")
Server → Filtered results with pagination
Response: List of verified animal shelters in Austin
```

### Quality Standards
- **Accuracy**: Official IRS data only, no speculation
- **Speed**: Sub-second response times for most queries
- **Reliability**: Graceful error handling with helpful messages
- **Consistency**: Standardized response formats across all tools

## Success Metrics

### Technical Success
- ✅ 4 core tools implemented and functional
- ✅ MCP protocol compliance
- ✅ Type-safe implementation
- ✅ Comprehensive validation
- ✅ Rate limiting and error handling

### User Experience Success
- Fast, accurate charity lookups
- Helpful error messages for invalid queries
- Consistent data formatting across tools
- Seamless integration with AI assistants

### Integration Success
- Claude Desktop compatibility
- Other MCP client compatibility
- Environment-based configuration
- Easy setup and deployment

## Target Scenarios

### Primary Use Cases
1. **Charity Verification**: Confirming legitimacy before donations
2. **Tax Planning**: Verifying deductibility for tax purposes
3. **Research**: Finding specific types of charitable organizations
4. **Due Diligence**: Getting complete organizational details

### Edge Cases Handled
- Invalid EIN formats
- Non-existent organizations
- API rate limiting
- Network timeouts
- Malformed search queries

## Current Status

### ✅ Feature Complete Implementation
**Achievement**: 100% complete charity MCP server exceeding all original requirements

**Delivered Capabilities**:
- **Core Functionality**: All 4 MCP tools implemented with comprehensive error handling
- **Enhanced Experience**: 14 prompt templates for guided charity research workflows
- **Enterprise Quality**: Production-ready architecture with full type safety
- **Advanced Features**: Template-driven user experience beyond basic requirements
- **Complete Documentation**: Comprehensive guides, examples, and interactive demo system

### Impact Delivered
This server successfully transforms complex charity data access into simple, reliable AI tool integration while providing an enhanced user experience through advanced prompt templating that guides users through common charity verification and research workflows.

**Key Achievements**:
- **Accessibility**: Complex IRS data made easily accessible to AI assistants
- **Reliability**: Enterprise-grade error handling and rate limiting
- **User Experience**: Pre-built prompts for common charity research scenarios
- **Integration**: Seamless MCP protocol compliance for broad compatibility
- **Quality**: Comprehensive testing and documentation for production use

The project represents a comprehensive solution that goes significantly beyond basic requirements to deliver a sophisticated charity research platform with enhanced user experience capabilities.
