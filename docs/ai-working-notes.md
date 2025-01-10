# AI Working Notes

## Project Overview

- Slack clone messaging app with modern UI
- Frontend: Next.js, React, Tailwind CSS, shadcn/ui
- Backend: Express.js, PostgreSQL, Prisma
- Testing: Jest, Cypress
- Logging: LogRocket (frontend), Winston (backend)

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
- Frontend: localhost:3000
- Backend: localhost:3001
- Console output captured in tests
- ELECTRON_ENABLE_LOGGING=1 set in npm scripts

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
