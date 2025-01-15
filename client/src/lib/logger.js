// Custom console wrapper that's allowed by ESLint
/* eslint-disable no-console */
const customConsole = {
  log: (...args) => console.log(...args),
  error: (...args) => console.error(...args),
  warn: (...args) => console.warn(...args),
  info: (...args) => console.info(...args),
  debug: (...args) => console.debug(...args),
};
/* eslint-enable no-console */

// Define log levels and their priorities
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  state: 4,
  perf: 5,
  flow: 6,
  feature: 7
};

// Get configured log level, default to 'warn'
const configuredLevel = process.env.LOG_LEVEL || 'warn';
const configuredPriority = LOG_LEVELS[configuredLevel.toLowerCase()] || LOG_LEVELS.warn;

// Format arguments to ensure objects are readable
const formatArgs = (args) => {
  return args.map(arg => {
    if (typeof arg === 'object' && arg !== null) {
      // If it's an Error object, preserve the stack trace
      if (arg instanceof Error) {
        return arg;
      }
      // For other objects, create a formatted string representation
      try {
        return JSON.stringify(arg, null, 2);
      } catch (err) {
        return '[Circular Object]';
      }
    }
    return arg;
  });
};

const logger = {
  error: (...args) => {
    if (LOG_LEVELS.error <= configuredPriority) {
      customConsole.error('[ERROR]', ...formatArgs(args));
    }
  },

  warn: (...args) => {
    if (LOG_LEVELS.warn <= configuredPriority) {
      customConsole.warn('[WARN]', ...formatArgs(args));
    }
  },

  info: (...args) => {
    if (LOG_LEVELS.info <= configuredPriority) {
      customConsole.info('[INFO]', ...formatArgs(args));
    }
  },

  debug: (...args) => {
    if (LOG_LEVELS.debug <= configuredPriority) {
      customConsole.debug('[DEBUG]', ...formatArgs(args));
    }
  },

  state: (...args) => {
    if (LOG_LEVELS.state <= configuredPriority) {
      customConsole.log('[STATE]', ...formatArgs(args));
    }
  },

  perf: (...args) => {
    if (LOG_LEVELS.perf <= configuredPriority) {
      customConsole.log('[PERF]', ...formatArgs(args));
    }
  },

  flow: (...args) => {
    if (LOG_LEVELS.flow <= configuredPriority) {
      customConsole.log('[FLOW]', ...formatArgs(args));
    }
  },

  feature: (...args) => {
    if (LOG_LEVELS.feature <= configuredPriority) {
      customConsole.log('[FEATURE]', ...formatArgs(args));
    }
  },

  startFeature: (feature) => {
    if (LOG_LEVELS.feature <= configuredPriority) {
      customConsole.log(`[FEATURE START] ${feature}`);
      return {
        end: () => {
          if (LOG_LEVELS.feature <= configuredPriority) {
            customConsole.log(`[FEATURE END] ${feature}`);
          }
        },
      };
    }
    return { end: () => {} };
  },
};

export default logger; 