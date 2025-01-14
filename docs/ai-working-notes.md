# AI Working Notes

## Project Overview

- Slack clone messaging app with modern UI
- Frontend: Next.js, React, Tailwind CSS, shadcn/ui
- Backend: Express.js, PostgreSQL, Prisma
- Testing: Jest, Cypress
- Logging: LogRocket (frontend), Winston (backend)
- Infrastructure: Terraform, AWS EC2, Docker, Heroku
- Environment Management: dotenvx for secure environment variable handling

## Authentication Implementation

1. Frontend Components:

   - Welcome page with guest access and Auth0 login
   - Clean, minimalist design using shadcn/ui components
   - Protected route wrapper for authenticated pages
   - Loading states with accessibility support
   - Seamless transition between guest and Auth0 auth
   - Username display in channel header

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
   - Auth0 users: Click "Sign in with Auth0" -> Auth0 redirect -> Callback -> App
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

5. Routes:

   - POST /api/auth/guest - Guest access with automatic unique naming
   - GET /api/auth/me - Get current user info
   - Auth0 handles regular user authentication

6. User Types:

   - Regular Users: Full Auth0 authentication
   - Guest Users:
     - Optional username input
     - Automatic unique name generation
     - Format: guestXXXX_username or guestXXXX_Anonymous Animal
     - Unicode support for international names
   - Last seen tracking for user presence

7. JWT Implementation:

   - Tokens include userId and isGuest flag
   - 24-hour expiration
   - Environment-specific secrets

8. Security Features:
   - Password hashing with bcrypt
   - Unique email and username constraints
   - Input validation and sanitization
   - Guest vs regular user access control
   - Auth0 for secure authentication
   - Control character filtering
   - Name length limits

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
   - Supports international characters
   - Preserves underscores
   - Fallback to timestamp-based names
2. Auth0 login:
   - Configured with tenant domain
   - Protected routes with authentication check
   - Automatic redirect to login

## Auth0 Configuration

- Domain: your-tenant.auth0.com
- Audience: https://api.chatgenius.com
- Client ID: your-client-id

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
