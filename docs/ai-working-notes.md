# AI Working Notes

## Project Overview

- Slack clone messaging app with modern UI
- Frontend: Next.js, React, Tailwind CSS, shadcn/ui
- Backend: Express.js, PostgreSQL, Prisma
- Testing: Jest, Cypress
- Logging: LogRocket (frontend), Winston (backend)
- Infrastructure: Terraform, AWS EC2, Docker, Heroku
- Environment Management: dotenvx for secure environment variable handling
- CI/CD: GitHub Actions with automatic .env file setup from .env.example

## Authentication Implementation

1. Frontend Components:

   - Welcome page with guest access and Auth0 login
   - Clean, minimalist design using shadcn/ui components
   - Protected route wrapper for authenticated pages
   - Loading states with accessibility support
   - Seamless transition between guest and Auth0 auth
   - Username display in channel header
   - LogoutButton component handling both Auth0 and guest logout

2. Auth Flow:

   - Guest users:
     - Optional name entry in input field
     - If name provided: Server adds "guestXXXX\_" prefix
     - If no name: Generates "Anonymous Animal" name
     - Automatic prefix "guestXXXX\_" with random number
     - Full Unicode support (CJK, Cyrillic, etc.)
     - Preserves underscores in usernames
     - Name length truncation (max 50 chars + prefix)
     - Invalid character cleaning
   - Auth0 users:
     - Click "Sign in with Auth0" -> Auth0 redirect -> Callback -> App
     - Automatic user creation/update on first login
     - Email and name synced from Auth0 profile
     - Secure JWT validation using JWKS
   - Token storage in localStorage
   - Automatic redirect to /channel/general when authenticated
   - Protected routes check both Auth0 and guest tokens

3. Test Coverage:

   - Unit tests for ProtectedRoute component:
     - Loading states
     - Auth0 authentication
     - Guest token authentication
     - Redirect behavior
   - E2E tests for guest login:
     - Empty name -> Anonymous Animal
     - Custom name with prefix
     - International name support
     - Underscore preservation
     - Invalid character cleaning
     - Name length truncation
     - Username display verification
   - Accessibility testing for loading states
   - Mock implementations for Auth0 and Next.js Router

4. Auth0 Configuration:

   - Single Page Application setup
   - Allowed URLs for local development:
     - Callback: http://localhost:3000
     - Logout: http://localhost:3000
     - Web Origins: http://localhost:3000
   - API identifier: https://api.chatgenius.com
   - Environment variables in .env.development
   - Backend integration:
     - JWKS validation for Auth0 tokens
     - User creation/update on login
     - Auth0 ID stored in database
     - Profile sync on each login

5. Routes:

   - POST /api/auth/guest - Guest access with automatic unique naming
   - GET /api/auth/me - Get current user info
   - GET /api/auth/auth0/callback - Handle Auth0 authentication
   - Auth0 handles regular user authentication

6. User Types:

   - Regular Users:
     - Full Auth0 authentication
     - Profile synced from Auth0
     - Unique auth0Id in database
   - Guest Users:
     - No custom name input (removed)
     - Automatic unique name generation
     - Format: guestXXXX_Anonymous Animal (e.g. guest1234_Anonymous Giraffe)
     - Always uses random animal name from predefined list
     - Unique 4-digit number prefix
   - Last seen tracking for user presence

7. JWT Implementation:

   - Guest tokens:
     - Include userId and isGuest flag
     - 24-hour expiration
     - Environment-specific secrets
   - Auth0 tokens:
     - RS256 algorithm
     - JWKS validation
     - Standard claims validation
     - Audience and issuer verification

8. Security Features:
   - Password hashing with bcrypt (for guest users)
   - Unique email and username constraints
   - Input validation and sanitization
   - Guest vs regular user access control
   - Auth0 for secure authentication
   - Control character filtering
   - Name length limits
   - JWKS key rotation support
   - Rate limiting on auth endpoints

## Infrastructure Configuration

1. AWS Resources:

   - Using existing VPC (vpc-025ad8b8b2d701979)
   - Subnet: 10.0.1.0/24 in us-east-1a
   - Security Group: Open ports 22, 80, 443, 3000-3001
   - EC2: t2.micro with Ubuntu 24.04 (ami-079cb33ef719a7b78)
   - 20GB gp3 root volume

2. Resource Naming/Tagging:

   - Format: {owner}-{project}-{environment}
   - Example: kstrikis-chatgenius-development
   - All resources tagged with:
     - Environment (development/production)
     - Project (chatgenius)
     - Owner (kstrikis)
     - Repository (kstrikis/next-gen-messaging)
     - ManagedBy (terraform)

3. Safety Checks:

   - Verify VPC exists
   - Check for subnet CIDR conflicts
   - Check for security group name conflicts
   - Validate resource existence before EC2 creation

4. Deployment Environments:
   - Development: terraform workspace "development"
   - Production: terraform workspace "production"
   - Identical configuration, separate state

## Current Frontend Issues

1. Left Sidebar:

   - Closes when clicking new channel button
   - "Open Sidebar" text non-functional
   - Needs proper event handling and transitions

2. Right Sidebar:

   - Currently placeholder implementation
   - Needs thread details, user profiles, activity feed
   - Show/hide behavior needs work
   - Should be implemented as compound component for thread views and user profiles

3. Message Interactions:
   - Emoji reactions not handling clicks
   - Status messages not updating in real-time
   - Notification circles not reflecting message state

## Implementation Recommendations

1. State Management:

   - Implement Redux with specific slices:
     - `ui`: Layout state (sidebar visibility)
     - `chat`: Messages and reactions
     - `users`: Status and presence
     - `notifications`: Unread counts and alerts

2. Event Handling:

   - Add proper event bubbling control
   - Implement stopPropagation() for nested click handlers
   - Ensure events don't trigger unintended side effects

3. Performance Optimizations:

   - Use React.memo for pure components
   - Implement useMemo for expensive computations
   - Add useCallback for event handlers
   - Consider code splitting for larger features

4. Accessibility Improvements:
   - Add ARIA labels to interactive elements
   - Ensure proper keyboard navigation
   - Implement focus management for modals/sidebars
   - Add screen reader support

## Component Structure

1. Layout:

   - CSS Grid with 3 columns
   - Left sidebar: 260px fixed width
     - Contains workspace switcher, channels list, DMs list
     - Collapsible with smooth transitions
     - Needs event propagation fixes for nested buttons
   - Main content: flexible width
     - Message list with date separators
     - Rich text composer with formatting
   - Right sidebar: 340px fixed width
     - Implement as compound component
     - Support thread views and user profiles
     - Handle show/hide transitions

2. Key Components:
   - LeftSidebar:
     - WorkspaceSwitcher: dropdown with workspace selection
     - NavigationMenu: Home, DMs, Activity links
     - ChannelsList: collapsible, shows unread states
     - DirectMessagesList: shows user status indicators
     - Add Channel button (needs event fix)
   - TopBar:
     - SearchBar with keyboard shortcuts
     - ChannelHeader with topic and member count
     - ActionsMenu for settings and help
   - Messages:
     - MessageList: grouped by date
     - Message: user info, reactions, actions
     - MessageComposer: rich text, emojis, attachments
   - Activity:
     - Tabbed interface for notifications/activity
     - Real-time updates for mentions and DMs

## Testing Configuration

- E2E tests run locally with 'npm run test:e2e'
- Environment variables loaded from .env.test using dotenvx
- Frontend: localhost:3000
- Backend: localhost:3001
- Test cleanup:
  - Kills processes on ports 3000 and 3001
  - Removes nodemon and dev processes
  - Uses trap for cleanup on exit
- Health checks before test execution
- Test suites:
  - API tests:
    - Health endpoint verification
    - API endpoint testing
  - Auth tests:
    - Guest login flow
    - Username validation
    - Token storage
    - Router mocking using next/navigation
    - Mock useRouter for protected route tests
  - UI tests:
    - Message composer functionality
    - Formatting toolbar behavior
    - Input validation
- Console output captured in tests
- Test logs aggregated per component
- Screenshots on failure
- Component testing:
  - Use data-testid for form elements
  - Avoid redundant ARIA roles
  - Follow Testing Library best practices
  - Prefer semantic queries over test IDs when possible
  - Mock next/navigation for routing tests
  - Mock Auth0 hooks for authentication tests

## Logging Strategy

Frontend:

- LogRocket in production
- Console logging in development (info and above)
- Debug logs filtered out
- Emoji prefixes for better readability
- Test environment:
  - Console methods intercepted
  - Logs aggregated per test
  - Network requests captured
  - Screenshots on failure

Backend:

- Winston for structured logging
- Separate log files by level
- Automatic error tracking

## Common Issues & Solutions

1. Server/Ports:

   - Client: 3000, Server: 3001
   - Check orphaned processes: `lsof -i :3000,3001`
   - Clean up with `pkill -f nodemon`
   - Memory limit: 4GB Node
   - Network timeout: 30s

2. Development Flow:

   - Stay in root directory for operations
   - Use npm scripts instead of direct commands
   - Verify process cleanup after tests
   - Monitor nodemon for crashes

3. Testing:

   - Run E2E tests locally only
   - Wait for health checks before starting
   - Use test:e2e script for proper setup
   - Check test logs for failures

4. State/Events:
   - Watch for event bubbling issues
   - Verify Redux state updates
   - Check WebSocket connections
   - Monitor real-time updates

## Next Steps

1. Frontend Fixes:

   - Implement Redux store
   - Fix sidebar event handling
   - Add compound components
   - Improve accessibility

2. Testing:

   - Add event handler tests
   - Verify state management
   - Test real-time updates
   - Check accessibility

3. Documentation:
   - Update component APIs
   - Document state patterns
   - Add troubleshooting guides
   - Include accessibility notes

## Deployment Configuration

### Port Configuration

- Client runs on port 3000 by default
- Server runs on port 3001 by default
- In production, ports are explicitly set via environment variables
- Port conflicts are prevented by configuration in root package.json

### Environment Variables

- Required variables:
  - DATABASE_URL: PostgreSQL connection string
  - PORT: Set by Heroku automatically
  - NODE_ENV: Set to 'production'

### Heroku Deployment

- Monorepo deployment configuration:
  - Uses root package.json scripts
  - Procfile runs both client and server
  - Automatic database migrations on release
  - Concurrent process management
  - Uses Node.js 22.x runtime
  - Builds both client and server

Required Configuration:

1. Environment Variables:

   - DATABASE_URL: PostgreSQL connection string
   - NODE_ENV: 'production'
   - CORS_ORIGIN: Heroku app URL
   - All other variables from .env.example

2. Build Process:

   - heroku-postbuild script handles installation
   - Builds both client and server
   - Runs Prisma migrations on release
   - Starts both services concurrently

3. Resource Requirements:

   - Minimum: Standard-1X dyno
   - PostgreSQL addon
   - Build pack: heroku/nodejs

4. Scaling Considerations:

   - Client and server run on same dyno
   - Consider separate deployments for scale
   - Monitor memory usage
   - Watch for concurrent connection limits

5. Docker Setup:

   - Multi-stage Dockerfile for optimized builds
   - Client and server in single container
   - Production dependencies only
   - Nginx reverse proxy for routing
   - Container healthcheck on port 3001
   - Prisma client generation in both stages
   - Netcat for database readiness checks

6. Container Architecture:

   - App container: Node.js 22 (client + server)
   - Database: PostgreSQL latest
   - Nginx: Alpine-based reverse proxy
   - Docker network for internal communication

7. Environment Configuration:

   - NODE_ENV=production
   - Database URL with container networking
   - CORS configuration for security
   - Port mappings (80 -> 3000/3001)

8. EC2 Setup:

   - Using existing instance i-00b9543a918aee8bb (kstrikis-week1-chatgenius)
   - Docker + Docker Compose installation via user data script
   - Automatic repository cloning
   - Environment configuration
   - Container orchestration
   - Instance restarted to apply user data changes

9. Networking:

   - Internal Docker network (bridge)
   - Nginx reverse proxy for routing
   - WebSocket support configured
   - Port 80 exposed to internet

10. Data Persistence:

    - PostgreSQL volume for data
    - Container restart policies
    - Backup considerations

11. Security:
    - Internal container networking
    - Environment variable isolation
    - Nginx security headers
    - No direct database exposure

## Environment Configuration

### Environment Files

- `.env.development`: Development environment variables
- `.env.test`: Test environment variables
- `.env`: Production environment variables
- `.env.example`: Template for environment variables

### Server Environment

- Required variables validated on startup
- Environment-specific configuration loaded automatically
- Logging of environment state on startup
- Graceful handling of missing variables

### Client Environment

- Next.js public variables prefixed with NEXT*PUBLIC*
- Environment-specific configuration via Next.js conventions
- API and socket URLs configured per environment
- Feature flags managed via environment variables

### Environment Loading

- Development: `.env.development`
- Test: `.env.test`
- Production: `.env`
- Variables validated at startup
- Missing required variables trigger startup failure

## Authentication System

- Guest access and Auth0 authentication
- Loading states with accessibility support
- Seamless transition between guest and Auth0 authentication
- Username display in channel header
- Full Unicode support for international names (CJK, Cyrillic, etc.)
- Control character and length validation
- Name length truncation
- Added GET /api/auth/me endpoint to retrieve current user info

## Test Environment

- Separate test database (chatgenius_test)
- Automated test database setup and cleanup
- Test environment configuration (.env.test)
- Test database is reset before each e2e test run
- Test database uses same schema but different data than development

## Auth Flow

1. Guest access:
   - Backend generates unique guest username
   - Format: guestXXXX_Anonymous Animal (e.g. guest1234_Anonymous Giraffe)
   - Consistent format across all guest login routes
   - Unique 4-digit number prefix
   - Random animal name from predefined list
2. Auth0 login:
   - Configured with tenant domain
   - Protected routes with authentication check
   - Automatic redirect to login

## Auth0 Configuration - WORKING SETUP

### Application Settings

1. Application Type: Single Page Application
2. Token Endpoint Authentication Method: None (changed from POST)
3. Required URLs:
   - Allowed Callback URLs: http://localhost:3000/callback
   - Allowed Web Origins: http://localhost:3000
   - Allowed Logout URLs: http://localhost:3000
4. Grant Types:
   - Authorization Code
   - Refresh Token

### Client Configuration

```jsx
<Auth0Provider
  domain="dev-szo6eu726ws4ythd.us.auth0.com"
  clientId="qfxIKGUBcnLL399HWAUHbDOSXOSG31ga"
  authorizationParams={{
    redirect_uri: typeof window !== 'undefined' ? `${window.location.origin}/callback` : undefined,
    scope: 'openid profile email',
  }}
  cacheLocation="localstorage"
>
  {children}
</Auth0Provider>
```

### Key Configuration Points

1. No audience parameter needed
2. Token Endpoint Authentication Method must be "None"
3. Using localstorage for token caching
4. Authorization Code flow with PKCE working correctly

### User Profile Data Available

- nickname
- name
- picture (Gravatar)
- email
- email_verified
- sub (Auth0 user ID)
- updated_at

### Debug Tools

- `/debug/auth` page working correctly
- Shows environment config
- Displays Auth0 context state
- Confirms token acquisition
- Provides user information

## API Endpoints

- POST /api/auth/guest - Create guest account
- GET /api/auth/me - Get current user info
- GET /api/health - Health check endpoint

## Environment Configuration

1. Environment Files:

   - Development: .env.development
   - Production: .env
   - Test: .env.test
   - Example: .env.example

2. Environment Loading:
   - Using dotenvx for secure environment variable management
   - Automatically loaded at start of npm scripts
   - Environment-specific files loaded based on script context
   - Separate configurations for client and server

## Auth0 Integration Issues and Solutions

### Configuration Issues Found

- Initial 401 Unauthorized errors were caused by incorrect audience configuration
- Using Management API audience (`https://dev-szo6eu726ws4ythd.us.auth0.com/api/v2/`) for user authentication was incorrect
- Missing proper Auth0 application settings in dashboard caused authentication flow issues

### Required Auth0 Application Settings

1. Application Type must be "Single Page Application"
2. Token Endpoint Authentication Method should be "None"
3. Required URLs must be configured:
   - Allowed Callback URLs: `http://localhost:3000/callback`
   - Allowed Web Origins: `http://localhost:3000`
   - Allowed Logout URLs: `http://localhost:3000`
4. Grant Types must include:
   - Authorization Code
   - Refresh Token

### Auth0Provider Configuration

```jsx
<Auth0Provider
  domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN}
  clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID}
  authorizationParams={{
    redirect_uri: typeof window !== 'undefined' ? `${window.location.origin}/callback` : '',
    scope: 'openid profile email',
    response_type: 'code',
  }}
  cacheLocation="localstorage"
  onRedirectCallback={appState => {
    window.location.href = appState?.returnTo || '/channel/general';
  }}
>
  {children}
</Auth0Provider>
```

### Debugging Tools Created

- Created `/debug/auth` page to diagnose Auth0 configuration and state
- Debug page shows:
  - Environment configuration
  - Auth0 context state
  - User information
  - Token acquisition status
  - Detailed error information

### Key Learnings

1. Don't use Management API audience for regular user authentication
2. Always verify Auth0 dashboard settings match client configuration
3. Use debug tools to verify configuration before proceeding with integration
4. Monitor Auth0 logs in dashboard for detailed error information

### TODO

- [ ] Implement proper error handling for Auth0 authentication failures
- [ ] Add logging for authentication events
- [ ] Create user sync process between Auth0 and local database
- [ ] Add refresh token handling
- [ ] Implement proper logout flow

## Authentication Flow - COMPLETED

- Auth0 integration using Authorization Code flow with PKCE
- Client-side Auth0 configuration in client/.env.development:
  - Domain: dev-szo6eu726ws4ythd.us.auth0.com
  - Client ID: qfxIKGUBcnLL399HWAUHbDOSXOSG31ga
  - No audience parameter needed for regular user authentication
  - Response type: code
  - Cache location: localstorage
- Server-side Auth0 configuration in server/.env.development:
  - Client secret required for token exchange
  - Callback URL must match Auth0 dashboard settings
  - JWT tokens generated after successful Auth0 authentication
- User synchronization with database implemented
- Token exchange working correctly
- Protected routes functioning
- Guest access implemented

## Next Feature: Real-time Messaging

### Database Schema Requirements

1. Message Model:

   - id: UUID
   - content: String
   - senderId: String (User relation)
   - channelId: String (Channel relation)
   - isEdited: Boolean
   - isPinned: Boolean
   - createdAt: DateTime
   - updatedAt: DateTime
   - reactions: Reaction[] relation
   - mentions: User[] relation

2. Reaction Model:

   - id: UUID
   - emoji: String
   - userId: String (User relation)
   - messageId: String (Message relation)
   - createdAt: DateTime
   - Unique constraint on [userId, messageId, emoji]
   - Indexes on userId and messageId

3. Updated Relations:
   - User model:
     - messages: Message[] (sent messages)
     - reactions: Reaction[] (message reactions)
     - mentions: Message[] (messages mentioning user)
   - Channel model:
     - messages: Message[] (channel messages)

### WebSocket Implementation Plan

1. Socket.IO Setup:

   - Namespace: /chat
   - Room per channel
   - Authentication via JWT
   - Connection state management
   - Reconnection handling
   - Presence tracking

2. Events:

   - message:send
   - message:received
   - message:edited
   - message:deleted
   - message:reaction
   - user:typing
   - user:online
   - user:offline
   - channel:joined
   - channel:left

3. Message Features:
   - Real-time delivery
   - Read receipts
   - Typing indicators
   - Online presence
   - Message history
   - Pagination
   - Search
   - Rich text formatting
   - File attachments (future)
   - Reactions
   - Thread replies (future)
   - Mentions
   - Link previews

### API Endpoints Required

1. Messages:

   - GET /api/channels/:channelId/messages - Get channel messages
   - POST /api/channels/:channelId/messages - Send new message
   - PUT /api/messages/:messageId - Edit message
   - DELETE /api/messages/:messageId - Delete message
   - POST /api/messages/:messageId/reactions - Add reaction
   - DELETE /api/messages/:messageId/reactions/:reactionId - Remove reaction

2. Channels:
   - GET /api/channels - List available channels
   - GET /api/channels/:channelId - Get channel details
   - POST /api/channels - Create new channel
   - PUT /api/channels/:channelId - Update channel
   - DELETE /api/channels/:channelId - Delete channel
   - POST /api/channels/:channelId/members - Add member
   - DELETE /api/channels/:channelId/members/:userId - Remove member

### Frontend Components Needed

1. Message Components:

   - MessageList
   - MessageItem
   - MessageInput
   - MessageActions
   - ReactionPicker
   - ReactionList
   - TypingIndicator
   - MessageStatus

2. Channel Components:
   - ChannelHeader
   - ChannelList
   - ChannelMembers
   - ChannelSettings
   - NewChannelModal
   - JoinChannelModal

### Testing Strategy

1. Unit Tests:

   - Message formatting
   - Input validation
   - Event handlers
   - Component rendering
   - State management

2. Integration Tests:

   - Message flow
   - WebSocket connections
   - Channel operations
   - User interactions

3. E2E Tests:
   - Complete message flow
   - Multi-user scenarios
   - Offline behavior
   - Error handling

### Performance Considerations

1. Message Loading:

   - Pagination
   - Infinite scroll
   - Message batching
   - Optimistic updates
   - Cache management

2. WebSocket Optimization:

   - Connection pooling
   - Message queuing
   - Reconnection strategy
   - Event debouncing
   - Presence optimization

3. Database:
   - Index optimization
   - Query performance
   - Connection pooling
   - Cache strategy
   - Archive policy

### Security Measures

1. Message Security:

   - Input sanitization
   - XSS prevention
   - File validation
   - Rate limiting
   - Permission checks

2. Channel Security:
   - Access control
   - Member validation
   - Invite system
   - Private channels
   - Admin controls

### Monitoring

1. Message Metrics:

   - Delivery time
   - Success rate
   - Error rate
   - User engagement
   - Channel activity

2. System Health:
   - WebSocket connections
   - Message queue
   - Database load
   - API performance
   - Error tracking

## Channel Implementation

1. Default Channels:

   - General channel created by default in both main and test databases
   - All users automatically added to general channel on registration/login
   - Channel membership tracked in database through many-to-many relationship
   - Channel routing uses IDs instead of names for consistency and reliability
   - Channel names still displayed in UI but not used for routing

2. Database Seeding:
   - Main database (chatgenius):
     - Seeded with general channel only
     - Uses upsert to avoid duplicates
   - Test database (chatgenius_test):
     - Seeded with general channel and test users
     - Clean slate on each test run
     - Test users automatically added to general channel
   - Explicit logging of which database is being seeded
   - Uses dotenvx for environment-specific seeding

## Database Seeding

1. Manual Seeding Commands:

   - Main database (chatgenius):
     ```bash
     cd server && npm run db:seed
     ```
   - Test database (chatgenius_test):
     ```bash
     cd server && npm run db:seed:test
     ```

2. Automated Test Database Setup:

   - Handled by `server/scripts/setup-test-db.js`
   - Triggered automatically when running:
     - E2E tests (`npm run test:e2e`)
     - Test server (`npm run start:test`)
   - Process:
     1. Drops existing test database
     2. Creates fresh test database
     3. Runs all migrations
     4. Seeds test data using `seed-test.js`
   - Ensures clean test environment for each run

3. Seeding Features:
   - Explicit database logging (shows which database is being seeded)
   - Uses dotenvx for environment-specific configuration
   - Creates general channel in both databases
   - Connects all users to general channel
   - Test database includes sample users of each type

## Real-time Messaging Implementation - IN PROGRESS

### Database Schema - COMPLETED

1. Message Model:

   - id: UUID
   - content: String
   - senderId: String (User relation)
   - channelId: String (Channel relation)
   - isEdited: Boolean
   - isPinned: Boolean
   - createdAt: DateTime
   - updatedAt: DateTime
   - reactions: Reaction[] relation
   - mentions: User[] relation
   - Indexes on senderId, channelId, and createdAt

2. Reaction Model:

   - id: UUID
   - emoji: String
   - userId: String (User relation)
   - messageId: String (Message relation)
   - createdAt: DateTime
   - Unique constraint on [userId, messageId, emoji]
   - Indexes on userId and messageId

3. Updated Relations:
   - User model:
     - messages: Message[] (sent messages)
     - reactions: Reaction[] (message reactions)
     - mentions: Message[] (messages mentioning user)
   - Channel model:
     - messages: Message[] (channel messages)

### API Implementation - COMPLETED

1. Message Endpoints:

   - GET /api/channels/:channelId/messages - Get channel messages with pagination
   - POST /api/channels/:channelId/messages - Send new message
   - PUT /api/messages/:messageId - Edit message
   - DELETE /api/messages/:messageId - Delete message
   - POST /api/messages/:messageId/reactions - Add reaction
   - DELETE /api/messages/:messageId/reactions/:reactionId - Remove reaction

2. Features:
   - Pagination support with cursor-based pagination
   - Message mentions with @ symbol
   - Reaction management with unique constraints
   - Proper error handling and logging
   - Automatic mention extraction from content

### WebSocket Implementation - COMPLETED

1. Socket.IO Setup:

   - Namespace: /chat (default)
   - Authentication via JWT
   - CORS configuration matching REST API
   - Room per channel (`channel:${channelId}`)
   - Connection state management
   - Automatic channel joining on connection

2. Events:

   - message:send - Send new message
   - message:received - Broadcast new message
   - message:reaction - Add/remove reaction
   - message:reaction:added - Broadcast new reaction
   - message:reaction:removed - Broadcast removed reaction
   - user:typing - Typing indicator
   - user:online - User connection status
   - user:offline - User disconnection status
   - user:mentioned - Mention notification

3. Features:
   - Real-time message delivery
   - Typing indicators
   - Online presence tracking
   - Multi-device support per user
   - Automatic channel room management
   - Last seen tracking
   - Mention notifications
   - Reaction synchronization

### Next Steps:

1. Frontend Implementation:

   - Message list component
   - Message composer
   - Real-time updates integration
   - Typing indicator UI
   - Reaction picker
   - Mention suggestions

2. Testing:

   - WebSocket connection tests
   - Message flow integration tests
   - Reaction handling tests
   - Presence tracking tests

3. Performance Optimization:
   - Message batching
   - Pagination implementation
   - Connection pooling
   - Error recovery
   - Reconnection handling

## Database Management

### Migration Commands

1. Production Database:

   ```bash
   cd server && npm run prisma:migrate:prod    # Run migrations (safe deploy)
   cd server && npm run prisma:studio:prod     # View/edit data
   cd server && npm run db:seed:prod           # Seed data
   ```

2. Development Database (chatgenius):

   ```bash
   cd server && npm run prisma:migrate:dev     # Run migrations
   cd server && npm run prisma:studio:dev      # View/edit data
   cd server && npm run db:seed:dev            # Seed data
   ```

3. Test Database (chatgenius_test):

   ```bash
   cd server && npm run prisma:migrate:test    # Run migrations
   cd server && npm run prisma:studio:test     # View/edit data
   cd server && npm run db:seed:test           # Seed test data
   ```

4. Environment Configuration:
   - Production uses .env
   - Development uses .env.development
   - Test uses .env.test
   - Each command explicitly states which database it's targeting
   - Migrations are tracked separately for each database
   - Production uses `migrate deploy` for safety (no reset)
   - Development/Test use `migrate dev` for schema changes

## Channel Routing and Navigation

- Channel routing now uses IDs instead of names for consistency and reliability
- Channel names are still displayed in the UI for user-friendliness
- The general channel (ID: 25268248-51d1-42d8-9e3e-73308ffa30d3) is used as a fallback
- Components handle channel navigation:
  - ChannelsList: Finds and sets general channel as active if no channel is selected
  - MessagesContainer: Attempts to fetch requested channel by ID, falls back to general channel if not found
- Channel membership is tracked in the database through a many-to-many relationship
- All users are automatically added to the general channel on registration/login

## Message Display Implementation

- MessageList component fetches messages from `/api/channels/:channelId/messages` endpoint
- Messages are grouped by date with date dividers
- Each message displays:
  - User avatar (with initials fallback)
  - Username
  - Timestamp
  - Message content
  - Reactions (if any)
  - Quick reaction buttons on hover
- Loading states and error handling implemented
- PropTypes validation added for type safety

## Next Steps

- Implement WebSocket integration for real-time message updates
- Add message editing and deletion functionality
- Implement reaction handling through WebSocket
- Add typing indicators
- Add message threading support
- Add file upload support

## Channel Members Implementation

- RightSidebar displays channel members list when in a channel
- ChannelMembers component fetches members from `/api/channels/:channelId/members` endpoint
- Each member displays:
  - Avatar with initials fallback
  - Username
  - Online status (when available)
- Loading states and error handling implemented
- Member count shown in header
- Responsive layout with proper border handling
- PropTypes validation for type safety

## Layout Updates

- MainLayout now handles channel/DM type detection from URL
- RightSidebar visibility controlled by content type
- Proper border handling between main content and sidebars
- Smooth transitions for sidebar visibility
- Responsive width handling for all columns
- Add message search functionality

## Utility Functions

### Text Utilities (`src/lib/text.js`)

1. `getInitials(name: string): string`
   - Extracts initials from user names for avatar fallbacks
   - Supports Western names: "John Doe" -> "JD"
   - Supports CJK characters: "李 小龙" -> "李小"
   - Handles separators (spaces, hyphens, underscores)
   - Returns uppercase initials (max 2 characters)
   - Used by Message component for avatar fallbacks
