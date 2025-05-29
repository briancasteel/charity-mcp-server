# Charity MCP Server

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server that provides AI assistants with access to charity and nonprofit organization data from the IRS database. This server enables AI tools to look up charity information, verify tax-deductible status, and search for nonprofit organizations.

## Features

### 🔍 **Charity Lookup**
- Look up detailed information about any charity using their EIN (Tax ID)
- Get comprehensive IRS data including official name, location, tax status, and classification codes
- Validate EIN format and business rules

### 🔎 **Charity Search** 
- Search for charities by organization name, city, or state
- Support for pagination and filtering
- Find organizations when you don't have their exact EIN

### ✅ **Public Charity Verification**
- Quickly verify if an organization qualifies as a tax-deductible public charity
- Check 501(c)(3) status for donation planning
- Instant verification of tax-deductible status

### 🛡️ **Enterprise Features**
- **Rate Limiting**: Configurable API rate limits to prevent abuse
- **Input Validation**: Comprehensive validation with security checks
- **Error Handling**: Robust error handling with user-friendly messages
- **Logging**: Detailed logging for monitoring and debugging
- **Type Safety**: Full TypeScript implementation with Zod schemas

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- CharityAPI account and API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd charity-mcp-server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API key and configuration
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Start the server**
   ```bash
   npm start
   ```

## Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# CharityAPI Configuration
CHARITY_API_BASE_URL=https://api.charityapi.org
CHARITY_API_KEY=your_api_key_here
CHARITY_API_TIMEOUT=10000
CHARITY_API_MAX_RETRIES=3
CHARITY_API_RETRY_DELAY=1000

# Server Configuration  
MAX_CONCURRENT_REQUESTS=10
REQUEST_TIMEOUT_MS=30000
ENABLE_CACHING=false
LOG_LEVEL=INFO

# Rate Limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=100
RATE_LIMIT_WINDOW_MS=60000
```

### API Key Setup

1. Sign up for a [CharityAPI account](https://charityapi.org)
2. Generate an API key from your dashboard
3. Add the API key to your `.env` file

## Available Tools

### 1. Charity Lookup (`charity_lookup`)

Look up detailed information about a specific charity using their EIN.

**Input:**
- `ein` (string, required): EIN in format "XX-XXXXXXX" or "XXXXXXXXX"

**Example:**
```json
{
  "ein": "13-1837418"
}
```

**Returns:**
- Complete organization details
- Tax deductibility status and codes
- Organization classification and activity codes
- Current IRS status and ruling information

### 2. Charity Search (`charity_search`)

Search for charities by name, location, or other criteria.

**Input:**
- `query` (string, optional): Organization name or keywords
- `city` (string, optional): Filter by city name
- `state` (string, optional): Filter by state (2-letter code)
- `limit` (number, optional): Results per page (1-100, default 25)
- `offset` (number, optional): Skip results for pagination (default 0)

**Example:**
```json
{
  "query": "American Red Cross",
  "state": "CA",
  "limit": 10
}
```

**Returns:**
- List of matching organizations
- Pagination information
- Basic details (name, EIN, location, deductibility)

### 3. Public Charity Check (`public_charity_check`)

Verify if an organization qualifies as a tax-deductible public charity.

**Input:**
- `ein` (string, required): EIN in format "XX-XXXXXXX" or "XXXXXXXXX"

**Example:**
```json
{
  "ein": "13-1837418"
}
```

**Returns:**
- Public charity status (yes/no)
- Tax-deductible donation eligibility
- EIN confirmation

## Usage with MCP Clients

### Claude Desktop

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "charity-server": {
      "command": "node",
      "args": ["path/to/charity-mcp-server/build/index.js"],
      "env": {
        "CHARITY_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### Other MCP Clients

The server implements the standard MCP protocol and works with any compatible client. Connect using stdio transport.

## Development

### Project Structure

```
src/
├── config/          # Configuration management
├── formatting/      # Response formatting utilities
├── schemas/         # Zod validation schemas
├── services/        # External API clients and rate limiting
├── tools/           # MCP tool implementations
├── transformers/    # Data transformation utilities
├── types/           # TypeScript type definitions
├── utils/           # Logging, error handling, validation
└── validation/      # Input validation and sanitization
```

### Development Commands

```bash
# Install dependencies
npm install

# Run in development mode with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Clean build artifacts
npm run clean

# Run tests (when implemented)
npm test

# Run linting (when configured)
npm run lint
```

### Architecture

The server follows a layered architecture:

1. **MCP Layer**: Handles protocol communication and tool registration
2. **Validation Layer**: Input sanitization and validation with Zod schemas
3. **Service Layer**: External API communication with rate limiting
4. **Transform Layer**: Data transformation and standardization
5. **Formatting Layer**: Response formatting for optimal AI consumption

### Key Components

- **Input Validation**: EIN format validation, security sanitization
- **Rate Limiting**: Token bucket algorithm with configurable limits
- **Error Handling**: Structured error responses with user-friendly messages
- **Logging**: Structured logging with configurable levels
- **Type Safety**: Full TypeScript coverage with runtime validation

## API Reference

### CharityAPI Integration

This server integrates with [CharityAPI.org](https://charityapi.org) to provide:

- Access to complete IRS nonprofit database
- Real-time charity information lookup
- Organization search and filtering capabilities
- Tax-deductible status verification

### Rate Limiting

Default rate limits:
- 100 requests per minute per tool
- Configurable via environment variables
- Automatic cleanup of expired tokens

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Maintain TypeScript strict mode compliance
- Add comprehensive input validation for new features
- Include error handling with user-friendly messages
- Update schemas and types for new data structures
- Add logging for debugging and monitoring
- Follow existing code organization patterns

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: Report bugs and feature requests via GitHub Issues
- **Documentation**: Additional documentation available in the `/docs` folder
- **CharityAPI**: For API-related questions, visit [CharityAPI.org](https://charityapi.org)

## Acknowledgments

- [Model Context Protocol](https://modelcontextprotocol.io) for the standard
- [CharityAPI.org](https://charityapi.org) for nonprofit data access
- The open source community for inspiration and contributions
