# System Patterns: Charity MCP Server

## Architecture Overview

### Layered Architecture
```
┌─────────────────┐
│   MCP Protocol  │ ← Tool/prompt registration, request handling
├─────────────────┤
│   Prompts       │ ← Template system, parameter substitution
├─────────────────┤
│   Validation    │ ← Input sanitization, schema validation
├─────────────────┤
│   Service       │ ← External API calls, rate limiting
├─────────────────┤
│   Transform     │ ← Data transformation, normalization
├─────────────────┤
│   Formatting    │ ← Response formatting, error messages
└─────────────────┘
```

### Core Components
- **MCP Server**: Protocol handler and tool/prompt registry
- **Tools**: Individual charity lookup/search implementations
- **Prompts**: Template-based prompt system with parameter validation
- **Services**: CharityAPI client and rate limiter
- **Validation**: Input sanitization and Zod schemas
- **Utils**: Logging, error handling, configuration

## Key Technical Decisions

### 1. Schema-First Validation
**Pattern**: Zod schemas define both TypeScript types and runtime validation
**Location**: `src/schemas/charity-schemas.ts`
**Rationale**: Single source of truth for data structure and validation
```typescript
export const EINSchema = z.string()
export const CharitySearchInputSchema = z.object({...})
export const CharityLookupResponseSchema = z.object({...})
```

### 2. Tool Registration Pattern
**Pattern**: Centralized tool registration with individual handlers
**Location**: `src/tools/index.ts`
**Implementation**:
```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [CHARITY_LOOKUP_TOOL, CHARITY_SEARCH_TOOL, ...]
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case 'charity_lookup': return await handleCharityLookup(args)
    // ...
  }
})
```

### 3. Prompt Registration Pattern
**Pattern**: Centralized prompt registration with template handlers
**Location**: `src/prompts/index.ts`
**Implementation**:
```typescript
server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts: [...VERIFICATION_PROMPTS, ...QUICK_REFERENCE_PROMPTS]
}))

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params
  // Route to appropriate prompt handler based on name
  return await handlePromptGeneration(name, args)
})
```

### 4. Template System Pattern
**Pattern**: Modular prompt templates with parameter substitution
**Location**: `src/prompts/verification-prompts.ts`, `src/prompts/quick-reference-prompts.ts`
**Benefits**:
- Reusable prompt templates
- Type-safe parameter validation
- Dynamic content generation
- Consistent prompt structure

### 5. Service Layer Abstraction
**Pattern**: External API calls abstracted behind service classes
**Location**: `src/services/charity-api.ts`
**Benefits**: 
- Testability (service can be mocked)
- Rate limiting integration
- Error handling standardization
- Configuration centralization

### 6. Rate Limiting Strategy
**Pattern**: Token bucket algorithm with automatic cleanup
**Location**: `src/services/rate-limiter.ts`
**Implementation**:
- 100 requests per minute default
- Per-tool rate limiting
- Automatic token cleanup every 5 minutes
- Configurable via environment variables

## Design Patterns in Use

### 1. Factory Pattern
**Usage**: Configuration loading and client initialization
**Example**: `loadCharityAPIConfig()` creates configured API client instances

### 2. Strategy Pattern
**Usage**: Different validation strategies for different input types
**Example**: EIN validation vs. search query validation

### 3. Template Method Pattern
**Usage**: Common error handling and response formatting
**Example**: All tools follow same validate → process → format → respond flow

### 4. Singleton Pattern
**Usage**: Global logger, rate limiter, API client instances
**Location**: Exported from `src/index.ts`

### 5. Builder Pattern
**Usage**: Prompt template construction with dynamic parameters
**Example**: Prompt templates built with parameter substitution and context

### 6. Command Pattern
**Usage**: Prompt handlers encapsulate template generation logic
**Example**: Each prompt type has dedicated handler with consistent interface

## Component Relationships

### Tool → Service Flow
```
Tool Handler
    ↓ (validates input)
Input Validator
    ↓ (checks rate limits)
Rate Limiter
    ↓ (makes API call)
CharityAPI Client
    ↓ (transforms data)
Charity Transformer
    ↓ (formats response)
Response Formatter
```

### Prompt → Template Flow
```
Prompt Handler
    ↓ (validates parameters)
Parameter Validator
    ↓ (selects template)
Template Selector
    ↓ (substitutes parameters)
Template Engine
    ↓ (formats prompt)
Prompt Formatter
    ↓ (returns to client)
Generated Prompt
```

### Error Handling Chain
```
Tool Handler
    ↓ (catches errors)
Error Handler
    ↓ (formats for user)
Error Formatter
    ↓ (logs details)
Logger
    ↓ (returns to MCP client)
MCP Response
```

## Critical Implementation Paths

### 1. Tool Execution Path
1. **Request Reception**: MCP server receives tool call
2. **Input Validation**: Zod schema validation + sanitization
3. **Rate Limiting**: Check and consume rate limit tokens
4. **API Call**: CharityAPI client makes HTTP request
5. **Data Transform**: Raw API data → standardized format
6. **Response Format**: Structured response for AI consumption
7. **Error Handling**: Graceful error formatting at each step

### 2. Prompt Generation Path
1. **Request Reception**: MCP server receives prompt request
2. **Template Selection**: Identify appropriate prompt template
3. **Parameter Validation**: Validate and sanitize input parameters
4. **Template Processing**: Substitute parameters into template
5. **Prompt Generation**: Create formatted prompt with context
6. **Response Format**: Return generated prompt to client
7. **Error Handling**: Template errors → user-friendly messages

### 3. Configuration Path
1. **Environment Loading**: dotenv loads .env file
2. **Config Validation**: Zod schemas validate configuration
3. **Client Initialization**: API client created with validated config
4. **Server Startup**: All components initialized before accepting requests

### 4. Error Recovery Path
1. **Error Detection**: Try/catch blocks in all async operations
2. **Error Classification**: Network, validation, API, or system errors
3. **User-Friendly Messages**: Technical errors → helpful descriptions
4. **Logging**: Detailed error info for debugging
5. **Graceful Degradation**: Partial failures don't crash server

## Code Organization Principles

### 1. Separation of Concerns
- Tools handle MCP protocol specifics for data operations
- Prompts handle template generation and user experience
- Services handle external integrations
- Validation handles input sanitization
- Formatting handles output standardization

### 2. Dependency Injection
- Services injected into tools (testability)
- Configuration injected into services
- Logger injected throughout application
- Template handlers injected into prompt system

### 3. Type Safety
- TypeScript strict mode enabled
- Zod runtime validation matches compile-time types
- No `any` types used
- Comprehensive error types defined
- Prompt parameter validation with type safety

### 4. Testability
- Service layer can be mocked
- Pure functions for transformations
- Dependency injection enables unit testing
- Test files co-located with implementation
- Prompt templates independently testable

### 5. Template Architecture
- Modular prompt templates with parameter substitution
- Consistent template structure across all prompt types
- Dynamic content generation based on parameters
- Reusable components for common patterns

## Current Implementation Status (January 2025)

### ✅ Complete Feature Set
**Achievement**: 100% feature complete charity MCP server with enterprise-grade architecture

**Comprehensive Implementation**:
- **All Core Tools**: 4 MCP tools with comprehensive error handling and validation
- **Complete Prompt System**: 14 templates (8 verification + 6 quick reference) with parameter validation
- **Enterprise Architecture**: Layered design with clean separation of concerns throughout
- **Type Safety**: Full TypeScript strict mode with runtime validation via Zod schemas
- **Production Quality**: Comprehensive testing, documentation, and interactive demo system
- **Advanced Features**: Template-driven user experience exceeding original requirements

### 🏗️ Architecture Excellence
This comprehensive architecture ensures maintainability, testability, and reliability while providing clean separation of concerns, full type safety, and enhanced user experience through advanced prompt templating capabilities that transform basic charity data access into a sophisticated research platform.

**Key Architectural Achievements**:
- **Pattern Consistency**: Unified patterns across all components (tools, prompts, services)
- **Error Resilience**: Comprehensive error handling with graceful degradation
- **Performance**: Optimized rate limiting and efficient API integration
- **Extensibility**: Template system allows easy addition of new prompt workflows
- **Maintainability**: Clear component boundaries and dependency injection throughout
