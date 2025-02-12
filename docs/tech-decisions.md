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

### Frontend Logging

1. **Environment Configuration**

   - All environments: Custom console wrapper
   - LOG_LEVEL environment variable controls all logging
   - Default level: 'warn' in all environments
   - Consistent log formatting
   - Automatic error tracking
   - Network monitoring
   - Redux integration

2. **Log Levels**

   - error (0): Critical errors needing immediate attention
   - warn (1): Potential issues or deprecated features
   - info (2): General application state information
   - debug (3): Detailed debugging information
   - state (4): Component/store state changes
   - perf (5): Performance measurements
   - flow (6): User/data flow tracking
   - feature (7): New feature implementation logs

3. **Test Environment**

   - Cypress intercepts all console methods
   - Logs filtered by LOG_LEVEL in both:
     - Cypress command log
     - Browser console
   - All logging tests skipped (unreliable)
   - Network requests captured
   - Aggregated per test

### Backend Logging (Winston)

1. **Configuration**

   - LOG_LEVEL environment variable controls all logging
   - Default level: 'warn' in all environments
   - Structured logging format
   - Error tracking with stack traces
   - Request/response logging
   - Performance monitoring

2. **Output Streams**

   - Console (filtered by LOG_LEVEL)
   - error.log (error level only)
   - combined.log (all levels up to LOG_LEVEL)

3. **Best Practices**

   - Contextual error logging
   - Performance tracking
   - Request tracing
   - Structured metadata
   - Error correlation
   - Security event logging

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

## Real-time Messaging Architecture

1. **WebSocket Technology**

   - Socket.IO for real-time communication
     - Built-in reconnection handling
     - Room-based channel management
     - Binary data support
     - Automatic fallback to polling
     - Client presence detection
     - Server-side events
     - Middleware support
     - Namespace organization

2. **Message Storage**

   - PostgreSQL for persistence
     - JSONB for rich message content
     - Full-text search capability
     - Efficient indexing
     - Transaction support
     - Referential integrity
     - Concurrent access
     - Message archival
     - Backup strategy

3. **Message Delivery**

   - Optimistic UI updates
   - Message queuing
   - Delivery receipts
   - Offline support
   - Message ordering
   - Conflict resolution
   - Rate limiting
   - Error handling

4. **Performance Optimization**

   - Message batching
   - Pagination strategy
   - Cache management
   - Connection pooling
   - Query optimization
   - Index management
   - Load balancing
   - Resource limits

5. **Security Considerations**

   - Input validation
   - Content sanitization
   - Rate limiting
   - Permission checks
   - Encryption
   - XSS prevention
   - CSRF protection
   - Audit logging

6. **Monitoring & Metrics**
   - Message delivery rates
   - System performance
   - Error tracking
   - User engagement
   - Resource usage
   - API latency
   - Socket health
   - Database load
