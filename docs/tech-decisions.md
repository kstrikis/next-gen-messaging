# Technical Decisions

This document outlines the key technical decisions made for the ChatGenius project and the reasoning behind them.

## Frontend

### React 18 vs 19

- Currently using React 18.2.0 instead of React 19
- Main reason: Auth0 React SDK compatibility (only supports up to React 18)
- Will upgrade once Auth0 adds React 19 support

### Next.js 15

- Using the latest version (15.1.4)
- Provides improved performance and features
- Compatible with React 18
- Includes built-in optimizations for static and server-side rendering

### UI Components

- **Tailwind CSS**: Chosen for utility-first approach and excellent developer experience
- **shadcn/ui**: Selected for:
  - High-quality, accessible components
  - Built on Radix UI primitives
  - Easy customization with Tailwind
  - No vendor lock-in (components are copied into the project)

### State Management

- **Redux Toolkit**: Chosen for:
  - Simplified Redux setup
  - Built-in immutability with Immer
  - Reduced boilerplate
  - TypeScript support
- **Redux Persist**: Added for state persistence across sessions
- **React Query**: Used for server state management and caching

## Backend

### Node.js & Express

- Using Node.js for JavaScript/ECMAScript consistency across the stack
- Express.js for its:
  - Minimal, unopinionated framework
  - Large ecosystem
  - Easy middleware integration
  - Excellent performance

### Database

- **PostgreSQL**: Selected for:
  - ACID compliance
  - Rich feature set
  - Excellent performance
  - Strong community support
- **Prisma**: Chosen as ORM for:
  - Type safety
  - Auto-generated migrations
  - Excellent developer experience
  - Built-in connection pooling

### Real-time Communication

- **Socket.IO**: Selected for:
  - WebSocket support with fallbacks
  - Room/namespace support
  - Built-in reconnection logic
  - Broadcasting capabilities

## Testing

### Multiple Testing Layers

- **Jest**: Unit testing
- **React Testing Library**: Component testing
- **SuperTest**: API testing
- **Cypress**: End-to-end testing
- **Storybook**: Component development and visual testing

## Code Quality

### ESLint & Prettier

- ESLint v9 with Airbnb config for consistent code style
- Prettier for automatic code formatting
- Configured to work together without conflicts

### Version Control & CI

- Git for version control
- Husky for Git hooks
- GitHub Actions planned for CI/CD

## Security

### Authentication

- **Auth0**: Chosen for:
  - Robust security features
  - Social login support
  - JWT handling
  - MFA support
  - Enterprise features

### API Security

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Protection against abuse
- Environment variables for sensitive data

## Monitoring & Logging

### Frontend Logging

- **LogRocket**: Selected for:
  - Session replay capabilities
  - Error tracking with stack traces
  - Performance monitoring
  - Network request monitoring
  - Console logs capture
  - Redux state tracking
  - Easy integration with React

### Backend Logging

- **Winston**: Chosen for:
  - Structured logging
  - Multiple transports
  - Custom log levels
  - Excellent performance
  - Rich metadata support

### ESLint Configuration

- Custom rules to enforce:
  - LogRocket usage in frontend
  - Winston usage in backend
  - No console.\* statements
  - Proper error handling

## Future Considerations

1. **React 19 Upgrade**

   - Monitor Auth0 React SDK for React 19 support
   - Plan upgrade when compatibility is confirmed

2. **Database Scaling**

   - Consider connection pooling optimization
   - Plan for read replicas if needed
   - Evaluate caching strategies

3. **Monitoring & Logging**

   - Implement comprehensive logging strategy
   - Set up monitoring and alerting
   - Consider APM solutions

4. **Performance Optimization**
   - Implement code splitting
   - Add service worker for offline support
   - Optimize asset delivery

## Frontend Patterns

1. Testing:

   - Use `data-testid` for form elements and other test-specific selectors
   - Avoid redundant ARIA roles (e.g., `role="form"` on `<form>` elements)
   - Prefer semantic queries (getByRole, getByLabelText) over test IDs when possible
   - Use Testing Library's user-centric queries

2. Component Structure:

   - Use shadcn/ui components as base building blocks
   - Extend with compound components for complex features
   - Follow React.forwardRef pattern for all components
   - Use displayName for better debugging

3. Styling:

   - Use Tailwind CSS with cn utility for class merging
   - Follow class-variance-authority (cva) for variant patterns
   - Maintain consistent className ordering:
     1. Layout (flex, grid, position)
     2. Spacing (padding, margin)
     3. Visual (colors, borders)
     4. Interactive states (hover, focus)

4. Accessibility:

   - Add ARIA labels to interactive elements
   - Use semantic HTML elements
   - Implement proper keyboard navigation
   - Ensure focus management in modals/overlays

5. State Management:

   - Use React hooks for local state
   - Implement context for shared state
   - Plan Redux integration for global state
   - Follow event delegation patterns

6. Error Handling:

   - Use try/catch blocks
   - Implement error boundaries
   - Log errors with context
   - Show user-friendly error messages

7. Logging:

   - Use emoji prefixes for better readability
   - Log important state changes
   - Include relevant context in log messages
   - Follow severity levels (debug, info, warn, error)

8. Code Organization:
   - Group related components in feature directories
   - Separate UI components from business logic
   - Keep components focused and small
   - Use index files for clean exports

## Backend Patterns
