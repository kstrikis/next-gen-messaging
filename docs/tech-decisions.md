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
   - Avoid redundant ARIA roles
   - Mock complex dependencies
   - Test user interactions
   - Verify log messages
   - Check component state changes

2. **End-to-End Tests (Cypress)**

   - Test critical user flows
   - Verify API interactions
   - Check real-time updates
   - Monitor console logs
   - Test error scenarios
   - Validate UI states

3. **Visual Testing (Storybook)**
   - Document component variants
   - Test responsive behavior
   - Verify accessibility
   - Showcase interactions
   - Test edge cases

### Backend Testing

1. **Unit Tests (Jest)**

   - Test business logic
   - Mock external services
   - Verify error handling
   - Check log messages
   - Test edge cases
   - Validate input/output

2. **Integration Tests (SuperTest)**
   - Test API endpoints
   - Verify database operations
   - Check authentication
   - Test error responses
   - Validate logging
   - Monitor performance

### Test Environment & Best Practices

1. **Environment Setup**

   - Separate test database
   - Mocked external services
   - Controlled logging output
   - Clean state between tests
   - Predictable timestamps
   - Transaction rollbacks

2. **Organization**

   - Group by feature/component
   - Clear test descriptions
   - Setup/teardown helpers
   - Shared test utilities
   - Consistent naming patterns

3. **Coverage Requirements**

   - Critical paths: 100%
   - Business logic: 100%
   - UI components: 80%+
   - Error scenarios
   - Edge cases
   - Performance benchmarks

4. **Test Data Management**
   - Use factories/fixtures
   - Avoid hardcoded values
   - Clean up after tests
   - Realistic test cases
   - Cover edge cases

## Logging Strategy

### Frontend Logging (LogRocket)

1. **Environment Configuration**

   - Production: LogRocket + console
   - Development: Console only
   - Test: Cypress-interceptable
   - Debug logs filtered in dev/test

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

4. **Helper Methods**
   - trackFlow: Journey tracking
   - measurePerf: Performance
   - trackState: State changes

### Backend Logging (Winston)

1. **Transport Configuration**

   - Console: All environments
   - error.log: Sync writes
   - combined.log: Info+
   - development.log: Dev only

2. **Format & Structure**

   - Dev: Human-readable
   - Prod: JSON format
   - Key=value metadata
   - Stack traces

3. **Error Handling**

   - Uncaught exceptions
   - Unhandled rejections
   - Process exit logging
   - Synchronous crash logs

4. **File Management**
   - 10MB size limit
   - 5 file rotation
   - Auto-create directories
   - Environment paths

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
