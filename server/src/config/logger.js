import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Helper to determine if we're in the server directory
const isInServerDir = process.cwd().endsWith('server');

// Configuration values from environment variables
const config = {
  logDir: process.env.LOG_DIR || path.join(process.cwd(), isInServerDir ? 'logs' : 'server/logs'),
  defaultLevel: process.env.LOG_LEVEL || 'info',
  isDevelopment: process.env.NODE_ENV !== 'production',
  maxLogSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
};

// Ensure log directory exists
if (!fs.existsSync(config.logDir)) {
  fs.mkdirSync(config.logDir, { recursive: true });
}

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
  winston.format.colorize({ all: false }),
  winston.format.printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}]`;
    
    // Handle string messages and metadata
    if (typeof message === 'object') {
      msg += ' ' + JSON.stringify(message, null, 2);
    } else {
      msg += ' ' + message;
    }
    
    // Add any remaining metadata as key=value pairs
    if (metadata && Object.keys(metadata).length > 0 && !metadata.data) {
      const cleanMetadata = { ...metadata };
      delete cleanMetadata.splat;
      msg += ' ' + Object.entries(cleanMetadata)
        .map(([key, value]) => `${key}=${typeof value === 'object' ? JSON.stringify(value, null, 2) : value}`)
        .join(' ');
    }
    
    return msg;
  }),
);

// Production format (JSON-based for better parsing)
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json(),
);

// Create the logger with proper error handling
const logger = winston.createLogger({
  levels,
  level: config.defaultLevel,
  format: config.isDevelopment ? devFormat : prodFormat,
  transports: [
    // Console transport for immediate feedback
    new winston.transports.Console({
      format: config.isDevelopment ? devFormat : prodFormat,
      handleExceptions: true,
      handleRejections: true,
    }),
    
    // Error logs (highest priority)
    new winston.transports.File({ 
      filename: path.join(config.logDir, 'error.log'),
      level: 'error',
      maxsize: config.maxLogSize,
      maxFiles: config.maxFiles,
      handleExceptions: true,
      handleRejections: true,
      sync: true, // Synchronous writes for crash logs
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

// Ensure logs are written before exit
process.on('exit', (code) => {
  if (code !== 0) {
    const errorMsg = `Process exiting with code ${code}`;
    // Force sync write to error log
    fs.appendFileSync(
      path.join(config.logDir, 'error.log'),
      `${new Date().toISOString()} [error]: ${errorMsg}\n`
    );
  }
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