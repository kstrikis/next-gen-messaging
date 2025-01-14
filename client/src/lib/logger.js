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

const logger = {
  error: (...args) => {
    customConsole.error('[ERROR]', ...args);
  },

  warn: (...args) => {
    customConsole.warn('[WARN]', ...args);
  },

  info: (...args) => {
    customConsole.info('[INFO]', ...args);
  },

  debug: (...args) => {
    customConsole.debug('[DEBUG]', ...args);
  },

  state: (...args) => {
    customConsole.log('[STATE]', ...args);
  },

  perf: (...args) => {
    customConsole.log('[PERF]', ...args);
  },

  flow: (...args) => {
    customConsole.log('[FLOW]', ...args);
  },

  feature: (...args) => {
    customConsole.log('[FEATURE]', ...args);
  },

  startFeature: (feature) => {
    customConsole.log(`[FEATURE START] ${feature}`);
    return {
      end: () => customConsole.log(`[FEATURE END] ${feature}`),
    };
  },
};

export default logger; 