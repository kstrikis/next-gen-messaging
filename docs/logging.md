# Logging System

## Overview

Our logging system is built on Winston with custom enhancements for development and debugging. It provides structured logging with different priority levels and specialized helpers for common development tasks.

## Log Levels

Logs are organized by priority (0 being highest):

| Level   | Priority | Purpose                                       |
| ------- | -------- | --------------------------------------------- |
| error   | 0        | Critical errors requiring immediate attention |
| warn    | 1        | Warning conditions                            |
| info    | 2        | General operational information               |
| debug   | 3        | Detailed debugging information                |
| state   | 4        | Application state changes                     |
| perf    | 5        | Performance measurements                      |
| flow    | 6        | User/data flow tracking                       |
| feature | 7        | Feature implementation progress               |

## Basic Usage

```javascript
import logger from '../config/logger.js';

// Basic logging
logger.error('Critical error occurred', { error });
logger.warn('Resource running low', { resource: 'memory' });
logger.info('Server started', { port: 3000 });
logger.debug('Processing request', { requestId });
```

## Helper Methods

Import helper methods for specialized logging:

```javascript
import loggerHelpers from '../config/loggerHelpers.js';

// Track feature implementation
const feature = loggerHelpers.startFeature('user-authentication');
feature.step('validating input');
feature.complete({ userId: 123 });
// Or if it fails:
feature.fail(error);

// Track user/data flow
const flow = loggerHelpers.trackFlow('checkout-process');
flow.step('validating cart');
flow.step('processing payment');
flow.end({ orderId: 456 });

// Measure performance
const perf = loggerHelpers.measurePerf('database-query');
await performQuery();
perf.end({ queryType: 'SELECT', rows: 100 });

// Track state changes
const stateTracker = loggerHelpers.trackState('ShoppingCart');
stateTracker.changed({ items: 2 }, { items: 3 }, { action: 'ADD_ITEM' });
```

## Log Files

Logs are written to different files based on level and environment:

- `error.log`: Contains only error-level logs
- `combined.log`: Contains logs of info level and above
- `development.log`: All logs in development environment

## Development Features

In development:

- File and line numbers are automatically added to logs
- Colorized console output
- Detailed metadata formatting
- Automatic performance measurements
- Stack traces for errors

## Production Features

In production:

- JSON-formatted logs for easy parsing
- Reduced verbosity
- Optimized for log aggregation
- Automatic log rotation
- Size-based log management

## Best Practices

1. **Use Appropriate Levels**

   - `error`: Only for critical issues
   - `warn`: For concerning but non-critical issues
   - `info`: For important operations
   - `debug`: For detailed troubleshooting

2. **Include Context**

   ```javascript
   // Good
   logger.error('Database connection failed', {
     host: db.host,
     error: error.message,
     attempt: retryCount,
   });

   // Bad
   logger.error('Database connection failed');
   ```

3. **Use Helper Methods**

   - Use `startFeature` when implementing new features
   - Use `trackFlow` for user journeys
   - Use `measurePerf` for performance-critical code
   - Use `trackState` for important state changes

4. **Avoid Console.log**
   - Always use the logger instead of console.log
   - ESLint will enforce this

## Configuration

The logging system can be configured through environment variables:

- `LOG_LEVEL`: Set the minimum log level
- `NODE_ENV`: Determines development/production behavior

## Log Rotation

Logs are automatically rotated:

- Maximum file size: 10MB
- Maximum files kept: 5

## Error Handling

The logger includes special handling for:

- Uncaught exceptions
- Unhandled rejections
- Graceful shutdown
- Logging system errors

### Error Schema

```javascript
// Error log format
{
  level: 'error',
  message: string,
  timestamp: ISOString,
  metadata: {
    error: {
      message: string,
      stack: string,
      type?: string
    },
    context?: {
      route?: string,
      requestId?: string,
      userId?: string
    }
  }
}

// Error response format
{
  error: string,
  code?: number,
  details?: object
}
```

### Testing Considerations

- Use error middleware pattern with `next(error)`
- Allow async operations to complete (100ms buffer)
- Verify both response format and log entries
- Use separate test log files
