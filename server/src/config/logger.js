import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import stackTrace from 'stack-trace';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration values that could be moved to environment variables
const config = {
  logDir: path.join(__dirname, '../../logs'),
  defaultLevel: process.env.LOG_LEVEL || 'info',
  isDevelopment: process.env.NODE_ENV !== 'production',
  maxLogSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
};

// Custom log levels with corrected priorities
const levels = {
  error: 0,    // Errors (highest priority)
  warn: 1,     // Warnings
  info: 2,     // Standard information
  debug: 3,    // Detailed debugging
  state: 4,    // State changes
  perf: 5,     // Performance measurements
  flow: 6,     // User/data flow tracking
  feature: 7,  // New feature implementation logs (lowest priority)
};

// Custom colors for better visibility
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'white',
  debug: 'gray',
  state: 'blue',
  perf: 'green',
  flow: 'cyan',
  feature: 'magenta',
};

// Add colors to winston
winston.addColors(colors);

// Development-focused format with reliable file/line tracking
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss.SSS' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    
    // Add file and line number in development using stack-trace
    if (config.isDevelopment) {
      const trace = stackTrace.get();
      // Skip internal winston frames and get to the actual caller
      const caller = trace.find(t => !t.getFileName()?.includes('node_modules/winston'));
      if (caller) {
        const file = path.basename(caller.getFileName() || 'unknown');
        const line = caller.getLineNumber();
        msg = `${timestamp} [${level}] ${file}:${line}: ${message}`;
      }
    }

    // Properly handle metadata
    if (metadata && Object.keys(metadata).length > 0) {
      const cleanMetadata = { ...metadata };
      delete cleanMetadata.splat; // Remove winston internal property
      msg += '\n' + JSON.stringify(cleanMetadata, null, 2);
    }
    
    return msg;
  }),
);

// Production format (JSON-based for better parsing)
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json(),
);

// Create a basic console transport for logging initialization errors
const emergencyTransport = new winston.transports.Console({
  format: winston.format.simple(),
});

// Create the logger with proper error handling
const logger = winston.createLogger({
  levels,
  level: config.defaultLevel,
  format: config.isDevelopment ? devFormat : prodFormat,
  transports: [
    // Console transport for immediate feedback
    new winston.transports.Console({
      format: config.isDevelopment ? devFormat : prodFormat,
    }),
    
    // Error logs (highest priority)
    new winston.transports.File({ 
      filename: path.join(config.logDir, 'error.log'),
      level: 'error',
      maxsize: config.maxLogSize,
      maxFiles: config.maxFiles,
    }),

    // Combined logs for info and above
    new winston.transports.File({ 
      filename: path.join(config.logDir, 'combined.log'),
      level: 'info',
      maxsize: config.maxLogSize,
      maxFiles: config.maxFiles,
    }),

    // Development logs for all levels in development
    ...(config.isDevelopment ? [
      new winston.transports.File({ 
        filename: path.join(config.logDir, 'development.log'),
        maxsize: config.maxLogSize,
        maxFiles: config.maxFiles,
      }),
    ] : []),
  ],
  // Prevent logger from exiting on error
  exitOnError: false,
});

// Handle logging errors gracefully
logger.on('error', (error) => {
  // Use the emergency transport directly to log errors
  emergencyTransport.log({
    level: 'error',
    message: 'Logging error occurred',
    error: error.message,
    stack: error.stack,
  });
});

// Ensure logs are written before exit
process.on('exit', () => {
  logger.end();
});

// Handle uncaught exceptions and unhandled rejections
if (config.isDevelopment) {
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', { error: error.stack });
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection:', { reason, promise });
  });
}

export default logger; 