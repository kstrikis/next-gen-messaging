import LogRocket from 'logrocket';

// Initialize LogRocket with your app ID
LogRocket.init('chatgenius/prod');

// Export a simple logger interface
export default {
  debug: LogRocket.log,
  info: LogRocket.info,
  warn: LogRocket.warn,
  error: LogRocket.error,
  track: LogRocket.track,
}; 