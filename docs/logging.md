# Logging Configuration

## Client Logger

The client logger is a custom console wrapper that respects log levels and provides consistent formatting:

```javascript
import logger from '@/lib/logger';

// Log levels in order of priority (lower number = higher priority)
const LOG_LEVELS = {
  error: 0, // Critical errors that need immediate attention
  warn: 1, // Warnings about potential issues
  info: 2, // General information about application state
  debug: 3, // Detailed debugging information
  state: 4, // State changes in components/stores
  perf: 5, // Performance measurements
  flow: 6, // User/data flow tracking
  feature: 7, // New feature implementation logs
};

// Log level is determined by:
// 1. process.env.LOG_LEVEL
// 2. Defaults to 'warn' in all environments
```

## Test Environment

In Cypress tests, logs are:

1. Filtered based on LOG_LEVEL in both:
   - Cypress command log
   - Browser console
2. Aggregated per test
3. Network requests are captured
4. All logging tests are skipped (unreliable with LOG_LEVEL changes)

## Server Logger

The server uses Winston for structured logging:

```javascript
import logger from '../config/logger.js';

// Log level is determined by process.env.LOG_LEVEL
// Defaults to 'warn' in all environments

// Logs are written to:
// 1. Console (filtered by LOG_LEVEL)
// 2. error.log (error level only)
// 3. combined.log (all levels up to LOG_LEVEL)
```

## Common Patterns

1. Use appropriate log levels:

   ```javascript
   logger.error('Critical failure', error);
   logger.warn('Deprecated feature used', { feature });
   logger.info('User logged in', { userId });
   logger.debug('Processing request', { payload });
   logger.state('Updated user preferences', { preferences });
   logger.perf('API call duration', { endpoint, duration });
   logger.flow('User started checkout', { cartId });
   logger.feature('New UI component rendered', { component });
   ```

2. Error handling:
   ```javascript
   try {
     // ... code ...
   } catch (error) {
     logger.error('Operation failed', {
       error,
       context: {
         /* relevant data */
       },
     });
   }
   ```

## Environment Configuration

- LOG_LEVEL environment variable controls logging across all environments
- Default level is 'warn' for all environments (development, test, production)
- All logging tests are skipped due to unreliability with LOG_LEVEL changes
- Browser console output is filtered based on LOG_LEVEL in Cypress tests
