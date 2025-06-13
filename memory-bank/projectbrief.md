# Project Brief: Charity MCP Server

## Overview
A Model Context Protocol (MCP) server that provides AI assistants with access to charity and nonprofit organization data from the IRS database via CharityAPI.org integration.

## Core Requirements

### Primary Goals
- Enable AI tools to look up detailed charity information using EIN (Tax ID)
- Provide charity search capabilities by name, location, and other criteria
- Verify tax-deductible status and public charity qualifications
- Maintain enterprise-grade reliability with rate limiting and error handling
- **Enhanced**: Provide pre-built prompt templates for common charity verification tasks
- **Enhanced**: Deliver superior user experience through guided prompts

### Target Users
- AI assistants and chatbots requiring charity data access
- Applications needing nonprofit organization verification
- Systems requiring tax-deductible donation status checks
- **Enhanced**: Users needing guided workflows for charity research and verification

### Success Criteria
- Seamless integration with MCP-compatible clients (Claude Desktop, etc.)
- Reliable real-time access to IRS charity database
- Comprehensive input validation and error handling
- Rate-limited API usage with configurable limits
- Type-safe implementation with runtime validation
- **Enhanced**: Complete MCP implementation (tools, resources, AND prompts)
- **Enhanced**: Comprehensive prompt system with 14+ templates for common scenarios

## Technical Scope

### Core Tools (4 Required - Complete)
1. **Charity Lookup** - Detailed organization info by EIN
2. **Charity Search** - Find organizations by name/location with pagination
3. **Public Charity Check** - Verify tax-deductible status
4. **List Organizations** - Browse/filter charity listings

### Enhanced Features (Beyond Requirements)
5. **Verification Prompts** (8 templates) - Guided charity verification workflows
6. **Quick Reference Prompts** (6 templates) - Streamlined lookup assistance
7. **Comprehensive Documentation** - Complete usage guides and examples
8. **Demo System** - Interactive examples and testing tools

### Quality Requirements
- TypeScript strict mode throughout
- Comprehensive input validation and sanitization
- Structured error handling with user-friendly messages
- Rate limiting to prevent API abuse
- Configurable environment-based setup
- **Enhanced**: Full test coverage including prompt system
- **Enhanced**: Production-grade documentation and examples

### Integration Requirements
- CharityAPI.org as primary data source
- MCP protocol compliance for client compatibility
- Stdio transport for local development
- Environment variable configuration
- **Enhanced**: Complete MCP capability implementation (tools + prompts)
- **Enhanced**: Template-driven prompt system with parameter validation

## Implementation Status

### ✅ Complete (Beyond Original Scope)
- All 4 core tools implemented with comprehensive error handling
- Complete prompt system with 14 templates for enhanced user experience
- Enterprise-grade architecture with layered design
- Full TypeScript type safety with runtime validation
- Comprehensive test suite covering all components
- Production-ready documentation and examples
- Demo system for testing and learning

### 🎯 Project Evolution
**Original Scope**: Basic 4-tool MCP server for charity data access
**Delivered**: Comprehensive charity research platform with advanced prompt templates

**Key Enhancements Beyond Requirements**:
- Advanced prompt system for guided workflows
- Complete documentation ecosystem
- Interactive demo and testing tools
- Enhanced user experience through template-driven interactions
- Production-grade error handling and validation

### Non-Requirements (Maintained)
- Data storage/caching (real-time API calls only)
- User authentication (server-to-server)
- Web interface (MCP protocol only)
- Custom charity data entry

This project successfully delivers all core requirements plus significant value-added features that enhance usability and provide a superior development experience.
