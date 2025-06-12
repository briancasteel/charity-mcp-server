# Project Brief: Charity MCP Server

## Overview
A Model Context Protocol (MCP) server that provides AI assistants with access to charity and nonprofit organization data from the IRS database via CharityAPI.org integration.

## Core Requirements

### Primary Goals
- Enable AI tools to look up detailed charity information using EIN (Tax ID)
- Provide charity search capabilities by name, location, and other criteria
- Verify tax-deductible status and public charity qualifications
- Maintain enterprise-grade reliability with rate limiting and error handling

### Target Users
- AI assistants and chatbots requiring charity data access
- Applications needing nonprofit organization verification
- Systems requiring tax-deductible donation status checks

### Success Criteria
- Seamless integration with MCP-compatible clients (Claude Desktop, etc.)
- Reliable real-time access to IRS charity database
- Comprehensive input validation and error handling
- Rate-limited API usage with configurable limits
- Type-safe implementation with runtime validation

## Technical Scope

### Core Tools (4 Required)
1. **Charity Lookup** - Detailed organization info by EIN
2. **Charity Search** - Find organizations by name/location with pagination
3. **Public Charity Check** - Verify tax-deductible status
4. **List Organizations** - Browse/filter charity listings

### Quality Requirements
- TypeScript strict mode throughout
- Comprehensive input validation and sanitization
- Structured error handling with user-friendly messages
- Rate limiting to prevent API abuse
- Configurable environment-based setup

### Integration Requirements
- CharityAPI.org as primary data source
- MCP protocol compliance for client compatibility
- Stdio transport for local development
- Environment variable configuration

## Non-Requirements
- Data storage/caching (real-time API calls only)
- User authentication (server-to-server)
- Web interface (MCP protocol only)
- Custom charity data entry
