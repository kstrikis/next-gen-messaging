# Technical Decisions

This document outlines the key technical decisions made for the ChatGenius project and the reasoning behind them.

## Frontend

### Core Technologies

1. **React 18**

   - Using React 18.2.0 instead of React 19
   - Main reason: Auth0 React SDK compatibility
   - Will upgrade once Auth0 adds React 19 support

2. **Next.js 15**

   - Using latest version (15.1.4)
   - Improved performance and features
   - Compatible with React 18
   - Built-in optimizations for SSR

3. **UI Components**

   - Tailwind CSS for utility-first styling
   - shadcn/ui for accessible, customizable components
   - Built on Radix UI primitives
   - No vendor lock-in

4. **State Management**
   - Redux Toolkit for global state
   - Redux Persist for session persistence
   - React Query for server state
   - React hooks for local state
   - Context for shared state

### Frontend Patterns

1. **Component Structure**

   - Use shadcn/ui as base building blocks
   - Extend with compound components
   - Follow React.forwardRef pattern
   - Use displayName for debugging
   - Keep components focused and small

2. **Styling**

   - Tailwind CSS with cn utility
   - class-variance-authority (cva) for variants
   - Consistent className ordering:
     1. Layout (flex, grid, position)
     2. Spacing (padding, margin)
     3. Visual (colors, borders)
     4. Interactive states (hover, focus)

3. **Accessibility**

   - ARIA labels for interactive elements
   - Semantic HTML elements
   - Proper keyboard navigation
   - Focus management in modals/overlays

4. **Error Handling**

   - try/catch blocks
   - Error boundaries
   - Contextual error logging
   - User-friendly error messages

5. **Code Organization**
   - Feature-based directory structure
   - Separate UI from business logic
   - Clean exports with index files
   - Consistent file naming

## Backend

### Core Technologies

1. **Node.js & Express**

   - JavaScript consistency across stack
   - Minimal, unopinionated framework
   - Large ecosystem
   - Easy middleware integration

2. **Database**

   - PostgreSQL for ACID compliance
   - Prisma ORM for type safety
   - Auto-generated migrations
   - Connection pooling

3. **Real-time Communication**
   - Socket.IO for WebSocket support
   - Room/namespace capabilities
   - Reconnection logic
   - Broadcasting features

### Security

1. **Authentication**

   - Auth0 for robust security
   - Social login support
   - JWT handling
   - MFA capabilities

2. **API Security**
   - Helmet for security headers
   - CORS configuration
   - Rate limiting
   - Environment variables

## Testing Strategy

### Frontend Testing

1. **Component Tests (Jest + Testing Library)**

   - Use data-testid for form elements
   - Prefer semantic queries (getByRole, getByLabelText)
   - Mock complex dependencies (logger, API)
   - Test user interactions (focus, blur, submit)
   - Verify log messages with jest.mock
   - Check component state changes
   - Test accessibility with ARIA labels
   - Maintain focus management
   - Test empty/error states
   - Verify event handlers

2. **End-to-End Tests (Cypress)**

   - Test critical user flows
   - Verify API interactions
   - Check real-time updates
   - Monitor console logs
   - Test error scenarios
   - Validate UI states
   - Intercept network requests
   - Test WebSocket events
   - Verify state persistence
   - Check responsive behavior

3. **Visual Testing (Storybook)**
   - Document component variants
   - Test responsive behavior
   - Verify accessibility
   - Showcase interactions
   - Test edge cases
   - Document props API
   - Show loading states
   - Test color themes
   - Validate animations
   - Check mobile views

### Backend Testing

1. **Unit Tests (Jest)**

   - Test business logic
   - Mock external services
   - Verify error handling
   - Check log messages
   - Test edge cases
   - Validate input/output
   - Test database queries
   - Verify middleware
   - Test utility functions
   - Check error classes

2. **Integration Tests (SuperTest)**
   - Test API endpoints
   - Verify database operations
   - Check authentication
   - Test error responses
   - Validate logging
   - Monitor performance
   - Test WebSocket events
   - Check rate limiting
   - Verify file uploads
   - Test transactions

### Test Environment & Best Practices

1. **Environment Setup**

   - Separate test database
   - Mocked external services
   - Controlled logging output
   - Clean state between tests
   - Predictable timestamps
   - Transaction rollbacks
   - Isolated test runs
   - CI/CD integration
   - Test data seeding
   - Environment variables

2. **Organization**

   - Group by feature/component
   - Clear test descriptions
   - Setup/teardown helpers
   - Shared test utilities
   - Consistent naming patterns
   - Mock configurations
   - Test data factories
   - Shared contexts
   - Helper functions
   - Custom matchers

3. **Coverage Requirements**

   - Critical paths: 100%
   - Business logic: 100%
   - UI components: 80%+
   - Error scenarios
   - Edge cases
   - Performance benchmarks
   - WebSocket events
   - Database queries
   - File operations
   - Security checks

4. **Test Data Management**
   - Use factories/fixtures
   - Avoid hardcoded values
   - Clean up after tests
   - Realistic test cases
   - Cover edge cases
   - Database seeding
   - Mock API responses
   - WebSocket events
   - File uploads
   - User sessions

## Logging Strategy

### Frontend Logging (LogRocket)

1. **Environment Configuration**

   - Production: LogRocket + console
   - Development: Console only
   - Test: Cypress-interceptable
   - Debug logs filtered in dev/test
   - Automatic error tracking
   - Session recording
   - Network monitoring
   - Redux integration
   - Performance metrics
   - Error boundaries

2. **Log Levels**

   - error: Application errors
   - warn: Non-critical issues
   - info: State changes and actions
   - debug: Detailed debugging
   - state: Component state
   - perf: Performance metrics
   - flow: User journey
   - feature: Implementation logs

3. **Format & Structure**

   - Emoji prefixes for scanning
   - Structured metadata
   - Consistent timestamps
   - JSON in test environment
   - Stack traces
   - Component context
   - User actions
   - State changes
   - Performance marks
   - Error details

4. **Helper Methods**
   - trackFlow: Journey tracking
   - measurePerf: Performance
   - trackState: State changes
   - logError: Error handling
   - logWarning: Warnings
   - logInfo: Information
   - logDebug: Debug info
   - logMetric: Metrics
   - logEvent: Events
   - logAction: Actions

### Backend Logging (Winston)

1. **Transport Configuration**

   - Console: All environments
   - error.log: Sync writes
   - combined.log: Info+
   - development.log: Dev only
   - Crash handling
   - Process monitoring
   - Uncaught exceptions
   - Unhandled rejections
   - Log rotation
   - Size limits

2. **Format & Structure**

   - Dev: Human-readable
   - Prod: JSON format
   - Key=value metadata
   - Stack traces
   - Request context
   - User context
   - Performance data
   - Database queries
   - API endpoints
   - WebSocket events

3. **Error Handling**

   - Uncaught exceptions
   - Unhandled rejections
   - Process exits
   - Crash reports
   - Error boundaries
   - API errors
   - Database errors
   - Network errors
   - Validation errors
   - Auth failures

4. **Log Management**

   - Log rotation
   - Size limits
   - Retention policy
   - Archival strategy
   - Search capability
   - Alert triggers
   - Dashboard views
   - Export options
   - Access control
   - Compliance

## Code Quality

1. **Linting & Formatting**

   - ESLint v8 (constrained by Airbnb config compatibility)
   - Using new ESLint flat config system (eslint.config.js)
   - Prettier integration
   - Custom logging rules
   - No console statements
   - Airbnb style guide enforcement

2. **Version Control**
   - Husky git hooks
   - Pre-commit linting
   - Pre-push tests
   - GitHub Actions CI/CD

## Future Considerations

1. **React 19 Upgrade**

   - Monitor Auth0 compatibility
   - Plan upgrade path

2. **Database Scaling**

   - Connection pooling
   - Read replicas
   - Caching strategy

3. **Performance**
   - Code splitting
   - Service worker
   - Asset optimization

## Authentication

- Using Auth0 for authentication
  - Single Page Application type
  - Authorization Code flow with PKCE
  - Token Endpoint Authentication Method: None
  - No audience parameter for regular authentication
  - Local storage for token caching
  - Debug tools at `/debug/auth` for configuration verification
  - JWT tokens for API access
  - User profile sync with local database
  - Email verification support planned
  - Role-based access control planned

## Environment Configuration

- Using dotenvx for environment variable management
  - Separate .env files for development, test, and production
  - Environment-specific files loaded based on script context
  - Separate configurations for client and server

## Database

- Using PostgreSQL with Prisma
  - Type-safe database access
  - Easy schema management
  - Built-in migrations

## API

- RESTful API design
- Version prefix: /api/v1
- Rate limiting implemented
- JWT authentication for protected routes

## Testing

- Jest for unit and integration tests
- Separate test database with its own schema
- Test data seeding for consistent test environment

## Logging

- Winston for server-side logging
- Structured logging format
- Different log levels for development and production

## Frontend

- Next.js for React framework
- Client-side state management with React hooks
- Tailwind CSS for styling

## WebSocket

- Socket.IO for real-time communication
- Separate WebSocket server
- Authentication handled through JWT tokens
