// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Capture and log browser console output
Cypress.on('window:before:load', (win) => {
  // Create a structured log collector
  win.testLogs = {
    console: [],
    network: [],
    errors: []
  };

  // Track test name for better log organization
  const testTitle = Cypress.currentTest ? Cypress.currentTest.title : 'Unknown Test';

  // Define log levels and their priorities
  const LOG_LEVELS = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
  };

  // Get configured log level from environment, default to 'warn'
  const configuredLevel = Cypress.env('LOG_LEVEL') || process.env.LOG_LEVEL || 'warn';
  const configuredPriority = LOG_LEVELS[configuredLevel.toLowerCase()] || LOG_LEVELS.warn;

  // Intercept all console methods
  ['log', 'warn', 'error', 'info', 'debug'].forEach(method => {
    const originalMethod = win.console[method];
    win.console[method] = (...args) => {
      // Determine if this log level should be shown
      const methodPriority = LOG_LEVELS[method] || LOG_LEVELS.info; // Default unknown methods to info level
      const shouldLog = methodPriority <= configuredPriority;

      // Only collect logs and show in Cypress UI if within configured level
      if (shouldLog) {
        const logEntry = {
          test: testTitle,
          type: method,
          timestamp: new Date().toISOString(),
          args: args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          )
        };
        win.testLogs.console.push(logEntry);

        // Log to Cypress command log immediately
        Cypress.log({
          name: 'console',
          displayName: `🖥️ ${method.toUpperCase()}`,
          message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '),
          consoleProps: () => logEntry
        });

        // Only call original console method if within configured level
        originalMethod.apply(win.console, args);
      }
    };
  });

  // Intercept network requests
  const originalFetch = win.fetch;
  win.fetch = async (...args) => {
    const startTime = Date.now();
    try {
      const response = await originalFetch.apply(win, args);
      const duration = Date.now() - startTime;
      const logEntry = {
        test: testTitle,
        type: 'fetch',
        timestamp: new Date().toISOString(),
        url: args[0],
        method: args[1]?.method || 'GET',
        status: response.status,
        duration,
      };
      win.testLogs.network.push(logEntry);

      // Log to Cypress command log
      Cypress.log({
        name: 'network',
        displayName: '🌐 FETCH',
        message: `${logEntry.method} ${logEntry.url} (${logEntry.status}) ${duration}ms`,
        consoleProps: () => logEntry
      });

      return response;
    } catch (error) {
      const logEntry = {
        test: testTitle,
        type: 'fetch',
        timestamp: new Date().toISOString(),
        url: args[0],
        method: args[1]?.method || 'GET',
        error: error.message,
        duration: Date.now() - startTime
      };
      win.testLogs.network.push(logEntry);

      // Log to Cypress command log
      Cypress.log({
        name: 'network',
        displayName: '🚫 FETCH ERROR',
        message: `${logEntry.method} ${logEntry.url} - ${error.message}`,
        consoleProps: () => logEntry
      });

      throw error;
    }
  };

  // Intercept errors with immediate logging
  win.addEventListener('error', (event) => {
    const logEntry = {
      test: testTitle,
      type: 'uncaught',
      timestamp: new Date().toISOString(),
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error ? event.error.stack : null
    };
    win.testLogs.errors.push(logEntry);

    // Log to Cypress command log
    Cypress.log({
      name: 'error',
      displayName: '❌ ERROR',
      message: event.message,
      consoleProps: () => logEntry
    });
  });

  // Intercept unhandled promise rejections with immediate logging
  win.addEventListener('unhandledrejection', (event) => {
    const logEntry = {
      test: testTitle,
      type: 'unhandledrejection',
      timestamp: new Date().toISOString(),
      message: event.reason ? event.reason.message : 'Unknown error',
      stack: event.reason ? event.reason.stack : null
    };
    win.testLogs.errors.push(logEntry);

    // Log to Cypress command log
    Cypress.log({
      name: 'error',
      displayName: '❌ PROMISE',
      message: logEntry.message,
      consoleProps: () => logEntry
    });
  });
});

// After each test, output summary of all logs
afterEach(() => {
  if (Cypress.spec.relative.includes('/ui/')) {
    cy.window().then((win) => {
      if (win.testLogs) {
        const summary = {
          test: Cypress.currentTest.title,
          consoleLogs: win.testLogs.console.length,
          networkRequests: win.testLogs.network.length,
          errors: win.testLogs.errors.length
        };

        // Always show test summary
        Cypress.log({
          name: 'summary',
          displayName: '📊 SUMMARY',
          message: `Console: ${summary.consoleLogs}, Network: ${summary.networkRequests}, Errors: ${summary.errors}`,
          consoleProps: () => ({
            ...summary,
            details: win.testLogs
          })
        });

        // Clear logs for next test
        win.testLogs = {
          console: [],
          network: [],
          errors: []
        };
      }
    });
  }
});

// Custom command for API requests
Cypress.Commands.add('api', {
  prevSubject: false
}, (method, path, options = {}) => {
  const baseUrl = Cypress.env('apiUrl');
  return cy.request({
    method,
    url: `${baseUrl}${path}`,
    failOnStatusCode: false, // Let tests handle status codes
    ...options
  });
});

// Custom command for WebSocket connections
Cypress.Commands.add('ws', {
  prevSubject: false
}, (path) => {
  const wsUrl = Cypress.env('wsUrl');
  return cy.window().then((win) => {
    const ws = new win.WebSocket(`${wsUrl}${path}`);
    return new Cypress.Promise((resolve) => {
      ws.onopen = () => resolve(ws);
    });
  });
});

// Intercept API calls for better testing
beforeEach(() => {
  // Start from a clean slate
  cy.clearLocalStorage();
  
  // Set up global API monitoring - use a parent command first
  cy.intercept(`${Cypress.env('apiUrl')}/**`, (req) => {
    // Log the request for debugging
    Cypress.log({
      name: 'API Call',
      message: `${req.method} ${req.url}`,
      consoleProps: () => ({ request: req })
    });
  });
});

// Log failed requests for debugging
Cypress.on('fail', (error, _runnable) => {
  // Log additional context for API failures
  if (error.message.includes('api')) {
    cy.log('API Error Context:', {
      url: error.request?.url,
      status: error.response?.status,
      body: error.response?.body
    });
  }
  throw error;
});