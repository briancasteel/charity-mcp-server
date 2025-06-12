# Tech Context: Charity MCP Server

## Technology Stack

### Core Technologies
- **TypeScript 5.0+**: Strict mode enabled, full type safety
- **Node.js 18+**: Runtime environment
- **MCP SDK 1.12.0**: Model Context Protocol implementation
- **Zod 3.22.0**: Schema validation and type generation

### External Dependencies
- **axios 1.6.0**: HTTP client for CharityAPI integration
- **dotenv 16.5.0**: Environment variable management
- **tslib 2.6.0**: TypeScript runtime library

### Development Dependencies
- **jest 29.5.0**: Testing framework
- **ts-jest 29.1.0**: TypeScript Jest transformer
- **ts-node 10.9.0**: TypeScript execution for development
- **@types/node 20.0.0**: Node.js type definitions
- **@types/jest 29.5.0**: Jest type definitions

## Development Setup

### Environment Requirements
```bash
Node.js: 18.0.0 or higher
npm: 8.0.0 or higher (or yarn equivalent)
TypeScript: 5.0.0 or higher
```

### Installation Process
```bash
# Clone and setup
git clone <repository-url>
cd charity-mcp-server
npm install

# Environment configuration
cp .env.example .env
# Edit .env with CharityAPI key

# Build and run
npm run build
npm start
```

### Development Commands
```bash
npm run dev          # Development mode with ts-node
npm run build        # Compile TypeScript to JavaScript
npm start            # Run compiled server
npm test             # Run Jest tests
npm run test:watch   # Watch mode testing
npm run test:coverage # Coverage report
npm run clean        # Remove build artifacts
```

### TypeScript Configuration
**File**: `tsconfig.json`
**Key Settings**:
- `strict: true` - Strict type checking
- `target: "ES2022"` - Modern JavaScript features
- `module: "ESNext"` - ES modules
- `moduleResolution: "node"` - Node.js module resolution
- `esModuleInterop: true` - CommonJS/ES module compatibility

### Jest Configuration
**File**: `jest.config.js`
**Setup**:
- TypeScript transformation via ts-jest
- Coverage collection from src/ directory
- Test file patterns: `*.test.ts`, `*.spec.ts`
- Test environment: Node.js

## External Integrations

### CharityAPI.org
**Base URL**: `https://api.charityapi.org`
**Authentication**: API key in headers
**Rate Limits**: 100 requests/minute (configurable)
**Endpoints Used**:
- `/v1/organizations/{ein}` - Charity lookup
- `/v1/organizations/search` - Charity search
- `/v1/organizations` - List organizations

**Error Codes**:
- 400: Bad Request (invalid parameters)
- 401: Unauthorized (invalid API key)
- 404: Not Found (charity doesn't exist)
- 429: Too Many Requests (rate limited)
- 500: Internal Server Error

### MCP Transport
**Protocol**: stdio (standard input/output)
**Client Compatibility**: Claude Desktop, other MCP clients
**Message Format**: JSON-RPC over stdio
**Capabilities Advertised**:
- `tools`: 4 charity-related tools
- `resources`: Empty (no static resources)
- `prompts`: Empty (no prompt templates)

## Technical Constraints

### Performance Requirements
- **Response Time**: < 2 seconds for API calls
- **Memory Usage**: < 100MB baseline
- **Rate Limiting**: 100 requests/minute default

### Security Considerations
- **Input Sanitization**: All inputs validated and sanitized
- **EIN Validation**: Strict format checking for tax IDs
- **API Key Protection**: Environment variable storage only
- **Error Disclosure**: No sensitive data in error messages

### Reliability Requirements
- **Error Handling**: Comprehensive try/catch blocks
- **Graceful Degradation**: Partial failures don't crash server
- **Logging**: Structured logging for monitoring
- **Retry Logic**: API calls with exponential backoff

## Development Environment

### IDE Configuration
**Recommended**: VSCode with extensions:
- TypeScript and JavaScript Language Features
- ESLint (when configured)
- Jest Test Explorer
- Better Comments

### File Structure
```
src/
├── config/          # Configuration loading and validation
│   └── index.ts
├── formatting/      # Response and error formatting
│   ├── error-formatter.ts
│   └── response-formatter.ts
├── schemas/         # Zod validation schemas
│   ├── charity-schemas.ts
│   └── charity-schemas.test.ts
├── services/        # External service clients
│   ├── charity-api.ts
│   ├── rate-limiter.ts
│   └── rate-limiter.test.ts
├── tools/           # MCP tool implementations
│   ├── index.ts
│   ├── charity-lookup.ts
│   ├── charity-search.ts
│   ├── list-organizations.ts
│   ├── list-organizations.test.ts
│   └── public-charity-check.ts
├── transformers/    # Data transformation utilities
│   └── charity-transformer.ts
├── types/           # TypeScript type definitions
│   └── server-capabilities.ts
├── utils/           # Shared utilities
│   ├── error-handler.ts
│   ├── error-handler.test.ts
│   ├── logger.ts
│   └── logger.test.ts
├── validation/      # Input validation and sanitization
│   ├── input-sanitizer.ts
│   ├── input-sanitizer.test.ts
│   ├── input-validator.ts
│   ├── input-validator.test.ts
│   ├── response-validator.ts
│   └── response-validator.test.ts
└── index.ts         # Server entry point
```

### Build Output
**Target Directory**: `build/`
**Generated Files**: Compiled JavaScript with source maps
**Entry Point**: `build/index.js`

## Tool Usage Patterns

### Development Workflow
1. **Code Changes**: Edit TypeScript files in `src/`
2. **Hot Reload**: Use `npm run dev` for automatic restarts
3. **Testing**: Run `npm test` for validation
4. **Build**: Use `npm run build` before deployment
5. **Production**: Run `npm start` with compiled code

### Debugging
- **Logging**: Structured logs via custom logger
- **Environment**: `LOG_LEVEL` controls verbosity
- **Error Context**: Full stack traces in development
- **API Debugging**: Request/response logging available

### Testing Strategy
- **Unit Tests**: Individual function/class testing
- **Integration Tests**: Tool end-to-end testing
- **Schema Tests**: Validation logic verification
- **Mock Services**: External API mocking for testing

This technical foundation provides a robust, maintainable, and type-safe implementation of the charity MCP server.
