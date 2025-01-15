# Application Startup Guide

## Local Development

### Prerequisites

- Node.js 22.x
- PostgreSQL
- Redis (optional, for caching)

### Environment Variables

Required environment variables:

```bash
# Core
NODE_ENV=development|test|production
DATABASE_URL=<postgresql_url>
PORT=3001
CLIENT_PORT=3000

# Logging
LOG_LEVEL=error|warn|info|debug|state|perf|flow|feature  # defaults to 'warn'

# Auth0
NEXT_PUBLIC_AUTH0_DOMAIN=<auth0_domain>
NEXT_PUBLIC_AUTH0_CLIENT_ID=<auth0_client_id>
```

### Development Mode

```bash
# Install all dependencies
npm run install:all

# Start both client and server in development mode
npm run dev

# Or start individually:
npm run dev:client  # Starts Next.js on port 3000
npm run dev:server  # Starts Express on port 3001
```

### Test Mode

```bash
# Run all tests
npm run test

# Run specific test suites
npm run test:unit      # Unit tests
npm run test:integration  # Integration tests
npm run test:e2e      # End-to-end tests

# Watch mode for development
npm run test:watch
```

## Production Deployment

### Local Production

```bash
# Build the client first
npm run build:client

# Start both client and server in production mode
npm run start
```

### Docker Deployment

The application is containerized using Docker and can be deployed using docker-compose:

```bash
docker-compose up -d
```

This will:

1. Build the application using the multi-stage Dockerfile
2. Start PostgreSQL database
3. Start the application container with both client and server
4. Expose ports 3000 (client) and 3001 (server)

### AWS Deployment

The application can be deployed to AWS using the provided deployment script:

```bash
./scripts/deploy-aws.sh
```

**Note**: The AWS deployment script:

- Uses a pre-existing VPC (vpc-025ad8b8b2d701979)
- Uses a pre-existing subnet (subnet-0245a1065b564d276)
- Uses a pre-existing security group (sg-020435edf9410848f)
- Uses or creates an EC2 key pair named "chatgenius-key"
- Deploys to a specific instance (i-00b9543a918aee8bb)

### Heroku Deployment

1. Prerequisites:

   - Heroku CLI installed
   - PostgreSQL add-on must be provisioned manually
   - Environment variables must be set in Heroku dashboard

2. Required Environment Variables:

   ```
   NODE_ENV=production
   DATABASE_URL=<heroku_postgresql_url>
   PORT=<heroku_assigned_port>
   CORS_ORIGIN=<your_frontend_url>
   LOG_LEVEL=warn  # recommended for production
   ```

3. Build Process:

   - Heroku automatically runs the `build` script
   - The build script:
     1. Installs all dependencies (root, client, server)
     2. Builds the Next.js client
     3. Builds the server (if needed)

4. Deployment:

   - Push to Heroku using Git
   - Heroku will automatically:
     - Install root dependencies using `npm install`
     - Run the `build` script
     - Start the application using the root `npm start` command

## Known Issues

1. Production Startup Discrepancy:

   - The root `package.json` `start` script only starts the server
   - In production, both client and server need to run
   - Docker deployment handles this correctly via `docker-start.sh`
   - Heroku deployment needs both processes but currently only starts server

2. Environment Configuration:
   - Multiple `.env` files exist (root, client, server)
   - Production deployment needs consolidation of environment variables
   - AWS deployment script contains hardcoded values that should be configurable

## Recommendations

1. Production Start Script:

   - Update root `package.json` to handle both client and server in production
   - Consider using `concurrently` for production as well
   - Or implement proper process management

2. Heroku Deployment:

   - Consider splitting into separate client/server deployments
   - Or use worker dynos for proper process management

3. Environment Management:
   - Consolidate environment variables
   - Use environment-specific configuration files
   - Implement proper secrets management

## Recent Updates

1. Production Startup:

   - Both client and server now start properly in production using `concurrently`
   - Docker startup script now properly handles production vs development modes
   - Root `package.json` start script updated to handle both processes
   - No separate Procfile needed for Heroku as we're using `concurrently`

2. Logging Configuration:

   - Single LOG_LEVEL environment variable controls all logging
   - Default level is 'warn' in all environments
   - All logging tests are skipped (unreliable)
   - Browser console output filtered in Cypress tests
   - Consistent log formatting across client and server

3. Next Steps:
   - Test the new production startup on all deployment platforms
   - Consider implementing proper process monitoring
   - Add health checks for both client and server
   - Implement graceful shutdown handling
