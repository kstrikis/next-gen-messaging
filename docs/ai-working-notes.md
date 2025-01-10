concise working notes for ai

Server:

- Server starts correctly on port 3001 for E2E tests
- E2E tests pass: 4 tests total (2 API tests, 2 health check tests)
- Nodemon "app crashed" messages are typical during CI runs - root cause unknown

E2E Testing:

- E2E tests must be run locally, not in CI
- AI agent will automatically verify E2E test results when running locally
- Start dev environment first, then run Cypress (never let Cypress manage the server)
- Use wait-on to ensure server is ready before starting Cypress
- Server must be accessible via 127.0.0.1 (not localhost) in local testing
- Directory handling:
  - Stay in root directory for all operations
  - Use npm scripts (dev:server) instead of cd commands
  - Cypress must run from root (where cypress.config.js is)
  - All paths in scripts are relative to root
- Cypress configuration:
  - Set baseUrl explicitly to http://127.0.0.1:3001
  - Enable debug logging for connection issues
  - Debug flags: cypress:server:socket, cypress:server:connection
- Port configuration:
  - Server runs on port 3001 (required by Cypress and client)
  - Client connects to server at 127.0.0.1:3001
  - Client runs on port 3000 (Next.js default)

Client Configuration:

- Connects to server via NEXT_PUBLIC_API_URL
- Connects to WebSocket via NEXT_PUBLIC_SOCKET_URL
- Both URLs point to server port 3001

Logging:

- LOG_LEVEL set in environment, not in NODE_ENV
- Server logs show successful startup and shutdown
- Database connection verified in logs
- Node.js warnings (Experimental/Deprecation) auto-categorized as warnings, not errors
- Process stderr warnings properly captured and categorized
- Log files working as expected:
  - error.log: only errors
  - combined.log: info and above (info, warn, error)
  - development.log: all logs in dev mode
- Colors working correctly:
  - errors in red
  - warnings in yellow
  - info in white
  - only level indicators colored, not full message

CI/Testing:

- Each GitHub Actions/act step runs in isolation with new shell
- CI runs all tests EXCEPT E2E tests
- Tests included in CI:
  - Linting
  - Unit tests
  - Integration tests
  - Database migrations
  - Build verification
- Docker containers in CI:
  - Uses postgres:latest for database
  - No Cypress container needed
- Environment variables:
  - DATABASE_URL uses postgres service name
  - API/WebSocket URLs use 127.0.0.1
  - No need for custom network configuration

Local Testing:

- E2E tests must be run locally using 'npm run test:e2e'
- AI agent will:
  - Run E2E tests locally
  - Monitor test execution
  - Verify test results
  - Debug any failures
  - Update documentation with results
- Local development uses localhost for all connections
- Database runs on standard port 5432

## E2E Testing Configuration

- Server must be started and verified healthy before running Cypress tests
- Health endpoint at http://localhost:3001/api/health must return 200
- Environment variables for debugging:
  - DEBUG=cypress:\* for Cypress debug logs
  - ELECTRON_ENABLE_LOGGING=1 for Electron logs
  - NODE_OPTIONS for memory and deprecation handling
- Wait timeout set to 30 seconds for server readiness
- Explicit health check with curl before starting tests
- Using cypress.config.js for test configuration

## Common Issues & Solutions

- Server port conflicts: Ensure port 3001 is free before starting tests
- Memory issues: Increased Node memory limit to 4GB
- Network timeouts: Added explicit wait-on with 30s timeout
- Debug logging: Enabled comprehensive debug output for troubleshooting
- Video recording: Disabled in CI to improve performance
