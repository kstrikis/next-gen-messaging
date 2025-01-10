import LogRocket from 'logrocket';

// Only initialize LogRocket in production
const isTest = typeof window !== 'undefined' && window.Cypress;
const isDev = process.env.NODE_ENV === 'development';

if (!isTest && !isDev) {
  LogRocket.init('chatgenius/prod', {
    console: {
      shouldAggregateConsoleErrors: true,
      isEnabled: true,
      methods: ['error', 'warn', 'info'],
    },
  });
}

// Helper to log both to console and LogRocket
const createLogger = (level) => (...args) => {
  // In test environment, use console directly for Cypress interception
  if (isTest) {
    // Skip debug logs in test environment
    if (level === 'debug') return;
    
    // Ensure args are stringified for Cypress
    const processedArgs = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    );
    // eslint-disable-next-line no-console
    console.log(`[${level}]`, ...processedArgs);
    return;
  }

  // Development: console only
  if (isDev) {
    // Skip debug logs in development
    if (level === 'debug') return;
    // eslint-disable-next-line no-console
    console.log(`[${level}]`, ...args);
    return;
  }

  // Production: both console and LogRocket
  // eslint-disable-next-line no-console
  console.log(`[${level}]`, ...args);
  LogRocket.track(level, { message: args.join(' ') });
};

// Export a simple logger interface with all allowed methods
const logger = {
  // Direct logging methods
  error: createLogger('error'),
  warn: createLogger('warn'),
  info: createLogger('info'),
  debug: createLogger('debug'),
  state: createLogger('state'),
  perf: createLogger('perf'),
  flow: createLogger('flow'),
  feature: createLogger('feature'),

  // Helper methods
  trackFlow: (flowName, data) => {
    const logger = createLogger('flow');
    logger(`Flow: ${flowName}`, data);
  },

  measurePerf: (label, duration) => {
    const logger = createLogger('perf');
    logger(`Performance: ${label}`, { duration });
  },

  trackState: (component, state) => {
    const logger = createLogger('state');
    logger(`State Change: ${component}`, state);
  }
};

// Expose logger to window in test environment
if (isTest && typeof window !== 'undefined') {
  window.logger = logger;
}

export default logger; 