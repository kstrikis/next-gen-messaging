import logger from './logger.js';

const loggerHelpers = {
  startFeature: (featureName) => {
    logger.feature(`🎯 Starting implementation: ${featureName}`);
    return {
      step: (stepName, data) => logger.feature(`↪️ ${featureName} - ${stepName}`, data),
      complete: (data) => logger.feature(`✅ Completed: ${featureName}`, data),
      fail: (error) => logger.error(`❌ Failed: ${featureName}`, { error }),
    };
  },

  trackFlow: (flowName) => {
    const startTime = process.hrtime();
    logger.flow(`⏱️ Flow started: ${flowName}`);
    return {
      step: (stepName, data) => logger.flow(`➡️ ${flowName} - ${stepName}`, data),
      end: (data) => {
        const [seconds, nanoseconds] = process.hrtime(startTime);
        const duration = seconds * 1000 + nanoseconds / 1000000;
        logger.flow(`⏹️ Flow completed: ${flowName}`, { 
          ...data, 
          duration_ms: duration.toFixed(2),
        });
      },
    };
  },

  measurePerf: (operationName) => {
    const startTime = process.hrtime();
    return {
      end: (data) => {
        const [seconds, nanoseconds] = process.hrtime(startTime);
        const duration = seconds * 1000 + nanoseconds / 1000000;
        logger.perf(`⚡ ${operationName}`, { 
          ...data, 
          duration_ms: duration.toFixed(2),
        });
      },
    };
  },

  trackState: (componentName) => ({
    changed: (from, to, metadata = {}) => {
      logger.state(`🔄 ${componentName} state changed`, {
        from,
        to,
        ...metadata,
      });
    },
  }),
};

export default loggerHelpers; 