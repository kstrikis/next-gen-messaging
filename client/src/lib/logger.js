const isDevelopment = process.env.NODE_ENV === 'development';

const logger = {
  error: (message, ...args) => {
    if (isDevelopment) {
      console.error(`[ERROR] ${message}`, ...args);
    }
    // In production, we could send this to LogRocket or another service
    if (process.env.NEXT_PUBLIC_LOGROCKET_APP_ID) {
      // LogRocket.captureException(args[0]);
    }
  },

  warn: (message, ...args) => {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },

  info: (message, ...args) => {
    if (isDevelopment) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },

  debug: (message, ...args) => {
    if (isDevelopment) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },

  state: (message, ...args) => {
    if (isDevelopment) {
      console.log(`[STATE] ${message}`, ...args);
    }
  },

  perf: (message, ...args) => {
    if (isDevelopment) {
      console.log(`[PERF] ${message}`, ...args);
    }
  },

  flow: (message, ...args) => {
    if (isDevelopment) {
      console.log(`[FLOW] ${message}`, ...args);
    }
  },

  feature: (message, ...args) => {
    if (isDevelopment) {
      console.log(`[FEATURE] ${message}`, ...args);
    }
  },

  startFeature: (featureName) => {
    if (isDevelopment) {
      console.group(`[FEATURE] ${featureName}`);
    }
    return {
      step: (stepName, data) => logger.feature(`↪️ ${featureName} - ${stepName}`, data),
      complete: (data) => {
        logger.feature(`✅ Completed: ${featureName}`, data);
        if (isDevelopment) {
          console.groupEnd();
        }
      },
      fail: (error) => {
        logger.error(`❌ Failed: ${featureName}`, error);
        if (isDevelopment) {
          console.groupEnd();
        }
      },
    };
  },
};

export default logger; 