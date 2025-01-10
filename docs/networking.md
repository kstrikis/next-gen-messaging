# Networking Configuration

## Port Assignments

### Server

- Default port: 3001
- Configured in:
  - `.env.test`
  - `server/.env.example`
  - `server/.env.test`
  - CI workflow (as environment variable)
- Used by:
  - Cypress (baseUrl in cypress.config.js)
  - Client API calls
  - Client WebSocket connections

### Client

- Default port: 3000
- Referenced in:
  - Server CORS configuration (CORS_ORIGIN in various .env files)
  - Auth0 callback URL configuration
  - Documentation and README files

## URL Configuration

### Development Environment

- Client URL: `http://localhost:3000`
- Server URL: `http://localhost:3001`
- API Endpoint: `http://localhost:3001`
- WebSocket: `http://localhost:3001`

### CI Environment

- Client URL: Uses container networking
- Server URL: Uses container networking
- API Endpoint: `http://app:3001` (Docker service alias)
- WebSocket: `http://app:3001` (Docker service alias)
- Database: `postgres:5432` (Docker service alias)

## Environment Variables

### Client-Side

- `NEXT_PUBLIC_API_URL`: Server API endpoint
- `NEXT_PUBLIC_SOCKET_URL`: WebSocket endpoint

### Server-Side

- `PORT`: Server port (3001)
- `CORS_ORIGIN`: Client origin for CORS (http://localhost:3000)

## Docker Networking

### Service Aliases

- Server container: `app`
- Database container: `postgres`

### Port Mappings

- Server: 3001:3001
- Client: 3000:3000
- Postgres: 5432:5432

## Important Notes

1. Cypress tests require server to be on port 3001
2. Client and server must run on different ports
3. CORS is configured to allow client-server communication
4. In CI, container networking requires service aliases
5. Auth0 callback URL must match client URL

## Required Configuration Files

### Next.js (next.config.mjs)

- API route rewrites/redirects
- External image domains
- Environment variables validation
- Webpack configuration
- Asset optimization settings

### Database

- Connection pool size
- SSL/TLS requirements
- Prisma connection URL format
- Read replica configuration
- Connection timeout settings

### Testing Infrastructure

- Mock service worker port (for API mocking)
- Test runner ports (Jest, etc.)
- Test database configuration
- Network isolation settings

## Environment-Specific Networking

### Development

- Local development URLs
- Hot reload ports
- Debug ports
- Local SSL certificates

### Staging

- Staging domain configuration
- Test data isolation
- Feature flag service ports
- Monitoring endpoints

### Production

- Load balancer configuration
- CDN setup
- Database replicas
- Backup service ports
- Monitoring service ports

## TODOs

1. Document WebSocket configuration:

   - Socket.IO client version (^4.8.1)
   - Socket.IO server version (^4.8.1)
   - WebSocket event types and protocols
   - Reconnection strategy

2. Document API Routes:

   - List all available endpoints (e.g., /api/users/profile)
   - Authentication requirements
   - Request/response formats

3. Security Configuration:

   - Document SSL/TLS setup for production
   - CORS policy details
   - Rate limiting configuration
   - Proxy settings if any

4. Production Environment:

   - Document production URLs and domains
   - Load balancer configuration
   - CDN setup
   - DNS configuration

5. Health Checks:
   - Document health check endpoints
   - Monitoring endpoints
   - Status page configuration
