concise working notes for ai

Server:

- Server starts correctly on port 3001 for E2E tests
- E2E tests pass: 4 tests total (2 API tests, 2 health check tests)
- Process management:
  - Graceful shutdown on all signals (SIGTERM, SIGINT, SIGUSR2)
  - Proper cleanup of server and database connections
  - Prevention of multiple shutdown attempts
  - Detailed shutdown logging
- Error handling:
  - Comprehensive error logging with stack traces
  - Request context in error logs (path, method)
  - Warning logs for 404 routes
  - Database connection error handling
  - JSON parsing error handling
  - Uncaught exception handling
  - Unhandled rejection handling
- Health monitoring:
  - Health check endpoint with uptime
  - Database connection status
  - Process status logging
- Nodemon behavior analysis:
  - "app crashed" messages occur during:
    - JSON parsing errors (common in tests)
    - Port conflicts (EADDRINUSE on 3001)
    - Simulated crashes (test scenarios)
  - Normal restart behavior when:
    - File changes detected
    - Process exits with code 1
  - Error handling:
    - Logs properly capture uncaught exceptions
    - Winston formats errors with timestamps
    - Stack traces preserved for debugging

E2E Testing:

- E2E tests must be run locally, not in CI
- Process management:
  - Using trap to ensure cleanup of background processes
  - All processes started with npm run dev
  - wait-on ensures services are ready
  - Automatic cleanup on script exit
  - No orphaned processes
- Service readiness:
  - Wait for server health check (port 3001)
  - Wait for client ready (port 3000)
  - 30 second timeout for each service
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
- Next.js structure:
  - Using .jsx extension for React components
  - Removed duplicate template files (page.js, layout.js)
  - Routes implemented and tested:
    - / - Home/general messages (200)
    - /dms - Direct messages view (200)
    - /channel/[id] - Individual channel view (200)
    - /activity - User activity and notifications (200)
  - Development server on port 3000
  - Future routes to implement: /activity
  - Missing routes to implement: /dms, /channel/:id

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

- Tests organized by type:
  - UI tests in cypress/e2e/ui/
  - API tests in cypress/e2e/api/
  - Integration tests in cypress/e2e/integration/
- Custom Cypress commands:
  - cy.api() for backend API requests
  - cy.ws() for WebSocket connections
  - Automatic request interception and logging
- Console output capture:
  - All browser console methods intercepted (log, warn, error, info, debug)
  - Console output captured and reported in test results
  - Automatic logging after each test
  - Spy-based implementation for accurate call tracking
- Environment configuration:
  - Frontend at http://localhost:3000
  - Backend at http://localhost:3001
  - WebSocket at ws://localhost:3001
- Server must be started and verified healthy before running Cypress tests
- Health endpoint at http://localhost:3001/api/health must return 200
- Environment variables for debugging:
  - DEBUG=cypress:\* for Cypress debug logs
  - ELECTRON_ENABLE_LOGGING=1 for Electron logs (set in npm test:e2e scripts)
  - NODE_OPTIONS for memory and deprecation handling
- Wait timeout set to 30 seconds for server readiness
- Explicit health check with curl before starting tests
- Using cypress.config.js for test configuration
- Process cleanup verified:
  - No lingering nodemon processes after test completion
  - Cleanup scripts working as expected
  - Verified via ps aux | grep nodemon

## Logging Strategy

Frontend Logging:

- Using LogRocket for frontend logging and session replay
- Simple logger interface in `client/src/lib/logger.js`
- Methods: debug, info, warn, error, track
- Development mode:
  - Console logging enabled (info and above)
  - Immediate feedback in browser console
  - Debug logs filtered out
- Production mode:
  - LogRocket configured to capture info and above
  - Console errors aggregated
  - Initialized with app ID 'chatgenius/prod'
- Used for:
  - Debug information
  - User actions tracking
  - Error reporting
  - Performance monitoring
  - Session replay

E2E Test Logging:

- Browser console capture:
  - All console methods intercepted
  - Logs aggregated per test
  - Automatic reporting in test output
  - Categorized by log level
  - Log format: args[0] contains level (e.g. "[info]"), subsequent args contain message and data
  - Emoji prefixes used for better log readability
- Network logging:
  - All API calls intercepted and logged
  - WebSocket connections monitored
  - Request/response details captured
  - Timing information included
- Error context enhancement:
  - Full error stack traces
  - Request context for API failures
  - Console error correlation
  - Network state at time of failure
- Visual logging:
  - Screenshots on test failure
  - DOM state capture
  - Network timeline
  - Console state

Backend Logging:

- Using Winston for server-side logging
- Separate log files for different levels
- Structured logging with timestamps
- Used for:
  - API requests/responses
  - Database operations
  - Server events
  - Error tracking

ESLint Configuration:

- Enforces Winston usage on backend
- Enforces LogRocket usage on frontend
- Prevents console.\* usage
- Separate rules for client/ and server/ directories

## Test Coverage

### Unit Tests

- `Button` component tests basic rendering and variants
- `MessageComposer` tests logging and interaction behaviors
- `MessagesContainer` tests message flow and placeholder text

### Integration Tests

- Database connection and user operations
- Health check endpoint

### E2E Tests

- API endpoints and error handling
- Health check and non-existent routes
- Message composer functionality including:
  - Text input and formatting
  - Quick actions (emoji, file attachment, mentions)
  - Message submission
  - Empty message validation
  - Formatting toolbar visibility

## Common Issues & Solutions

- Server port conflicts:
  - Check for orphaned processes with `lsof -i :3000,3001`
  - Previous test runs may leave Node processes running
  - Express server uses port 3001
  - Next.js client uses port 3000
  - Always verify process cleanup after tests
- Memory issues: Increased Node memory limit to 4GB
- Network timeouts: Added explicit wait-on with 30s timeout
- Debug logging: Enabled comprehensive debug output for troubleshooting
- Video recording: Disabled in CI to improve performance
- Process cleanup:
  - Use `lsof` to check for running processes
  - Use `ps -f -p PID` to identify process details
  - Ensure proper signal handling in test setup
  - Monitor process cleanup in test logs

## Frontend UI Implementation

Layout Components:

- Main layout uses CSS Grid for 3-column design
- Left sidebar: 260px fixed width, collapsible
  - Known issue: Closes unexpectedly when clicking new channel button
  - Known issue: "Open Sidebar" text not functional
  - Needs proper event handling and state management
- Main content: flexible width
- Right sidebar (optional): 340px fixed width
  - Currently placeholder implementation
  - Planned features:
    - Thread details and replies
    - User profiles and presence
    - Activity feed integration
  - Needs proper show/hide behavior
- Smooth transitions for sidebar toggle
- Responsive grid adjustments on sidebar collapse

Implemented Components:

- LeftSidebar
  - WorkspaceSwitcher (workspace name + dropdown)
  - NavigationMenu (Home, DMs, Activity)
  - ChannelsList (collapsible, unread states)
    - Known issue: New channel button closes sidebar
    - Needs proper event handling
  - DirectMessagesList (collapsible, user statuses)
    - Known issue: Status indicators not updating
    - Needs real-time state management
  - Add Channel button
- TopBar
  - SearchBar (with keyboard shortcut indicator)
  - ChannelHeader (name, topic, member count)
  - ActionsMenu (help, settings, huddle)
- Messages
  - MessageList (grouped by date, supports DM/channel types)
  - Message (user info, reactions, actions)
    - Known issue: Emoji reactions not handling clicks
    - Needs proper event handlers
  - MessageComposer:
    - Text input with auto-resize
    - Rich text formatting (bold, italic, link)
    - Quick actions (emoji, attachments, mentions)
    - Context-aware placeholder
    - Comprehensive logging for all actions
    - Disabled states for empty messages
    - Keyboard shortcuts (Enter to send)
- Activity
  - Tabbed interface (notifications/activity)
  - Notification types: mentions, channels, DMs
    - Known issue: Notification circles not updating
    - Needs real-time state management
  - Activity types: channel events, reactions, actions
  - Time-based sorting
  - Icon indicators for different types

Current Issues:

1. Sidebar Behavior:

   - New channel button closes sidebar unexpectedly
   - "Open Sidebar" text non-functional
   - Transition animations needed

2. Message Interactions:

   - Emoji reactions not handling clicks
   - Status messages not updating in real-time
   - Notification circles not reflecting message state

3. Right Sidebar:

   - Currently placeholder implementation
   - Needs clear purpose and functionality
   - Thread view implementation pending

4. State Management:
   - Real-time updates needed for:
     - User status indicators
     - Message notifications
     - Unread states
     - Emoji reactions

Next Implementation Steps:

1. Fix sidebar event handling
2. Implement proper state management
3. Add real-time updates for status and notifications
4. Complete right sidebar functionality
5. Add proper event handlers for message interactions

UI Framework:

- Using shadcn/ui components
- Tailwind for custom styling
- lucide-react for icons
- CSS Grid and Flexbox for layouts
- CSS variables for theming

Current Focus:

- Implementing static UI components
- Using placeholder data for development
- Focusing on component structure before API integration

Next Steps:

- Right sidebar components
  - Thread details and replies
  - User profiles and presence
  - Activity feed and notifications
- Implement search functionality
  - Search modal with keyboard shortcuts
  - Results filtering and highlighting
  - Recent searches
- Add rich text editing
  - Markdown support
  - File uploads
  - Emoji picker

State Management:

- Using React hooks for local state
- Planning Redux integration for:
  - User session
  - Channel/DM lists
  - Message threads
  - Online status
  - Search history
  - Message drafts
  - Reactions and emoji data
