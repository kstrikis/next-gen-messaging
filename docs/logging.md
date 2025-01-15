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
// 2. Defaults to 'warn' if not set
```

## Test Environment

In Cypress tests, logs are:

1. Filtered based on LOG_LEVEL in both:
   - Cypress command log
   - Browser console
2. Aggregated per test
3. Summarized after each test
4. Network requests are captured
5. Screenshots are taken on failure

## Server Logger

The server uses Winston for structured logging:

```javascript
import logger from '../config/logger.js';

// Log level is determined by process.env.LOG_LEVEL
// Defaults to 'info' in development, 'warn' in test

// Logs are written to:
// 1. Console (all levels)
// 2. error.log (error level)
// 3. combined.log (info and above)
// 4. development.log (all levels, only in development)
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

2. Feature tracking:

   ```javascript
   const feature = logger.startFeature('checkout');
   // ... feature code ...
   feature.end(); // Logs feature completion
   ```

3. Error handling:
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
