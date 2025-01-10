concise working notes for ai

Server:

- Server starts correctly on port 3001 for E2E tests
- E2E tests pass: 4 tests total (2 API tests, 2 health check tests)
- Nodemon "app crashed" messages are typical during CI runs - root cause unknown

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
- Main content: flexible width
- Right sidebar (optional): 340px fixed width
- Smooth transitions for sidebar toggle
- Responsive grid adjustments on sidebar collapse

Implemented Components:

- LeftSidebar
  - WorkspaceSwitcher (workspace name + dropdown)
  - NavigationMenu (Home, DMs, Activity)
  - ChannelsList (collapsible, unread states)
  - DirectMessagesList (collapsible, user statuses)
  - Add Channel button
- TopBar
  - SearchBar (with keyboard shortcut indicator)
  - ChannelHeader (name, topic, member count)
  - ActionsMenu (help, settings, huddle)
- Messages
  - MessageList (grouped by date)
  - Message (user info, reactions, actions)
  - MessageComposer (rich text, attachments)
- Features:
  - Collapsible sections with chevron indicators
  - Unread message indicators
  - User status indicators (online, offline, away)
  - Active state highlighting
  - Hover effects and transitions
  - Accessible button and link elements
  - Responsive design with breakpoints
  - Focus states and keyboard navigation
  - Auto-resizing message input
  - Message reactions and emoji support
  - Hover actions for messages
  - Date separators in message list

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

## Logging Strategy

Frontend Logging:

- Using LogRocket for frontend logging and session replay
- Simple logger interface in `client/src/lib/logger.js`
- Methods: debug, info, warn, error, track
- Initialized with app ID 'chatgenius/prod'
- Used for:
  - Debug information
  - User actions tracking
  - Error reporting
  - Performance monitoring
  - Session replay

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
