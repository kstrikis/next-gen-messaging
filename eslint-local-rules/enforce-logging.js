export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce proper logging patterns',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [{
      type: 'object',
      properties: {
        levels: {
          type: 'array',
          items: {
            type: 'string',
            enum: [
              'error',   // Priority 0: Critical errors that need immediate attention
              'warn',    // Priority 1: Warning conditions
              'info',    // Priority 2: General operational information
              'debug',   // Priority 3: Detailed debugging information
              'state',   // Priority 4: Application state changes
              'perf',    // Priority 5: Performance measurements
              'flow',    // Priority 6: User/data flow tracking
              'feature', // Priority 7: Feature implementation progress
            ],
          },
        },
        allowedMethods: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
      additionalProperties: false,
    }],
  },
  create(context) {
    const filename = context.getFilename();
    const isLoggerConfig = filename.includes('logger.js');
    const isLoggerHelper = filename.includes('loggerHelpers.js');
    const isLoggerRelated = isLoggerConfig || isLoggerHelper;

    // Winston's internal methods that we need to allow
    const winstonInternalMethods = [
      'on',       // Event handling
      'end',      // Graceful shutdown
      'close',    // Close transports
      'clear',    // Clear internal state
      'remove',   // Remove transport
      'configure',// Runtime configuration
      'add',      // Add transport
      'format',   // Format logs
      'log',      // Low-level logging
    ];
    
    // Our custom logging levels and their helper methods
    const customLoggingMethods = [
      // Direct logging methods (matching levels)
      'error',   // Critical errors
      'warn',    // Warnings
      'info',    // General information
      'debug',   // Debug information
      'state',   // State changes
      'perf',    // Performance logs
      'flow',    // Flow tracking
      'feature', // Feature progress

      // Helper methods (from loggerHelpers.js)
      'startFeature',  // Feature implementation tracking
      'trackFlow',     // User/data flow tracking
      'measurePerf',   // Performance measurement
      'trackState',    // State change tracking
    ];

    // Combine all allowed methods
    const allowedMethods = [...customLoggingMethods, ...winstonInternalMethods];

    return {
      // Prevent console.* usage except in logger configuration
      CallExpression(node) {
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.name === 'console'
        ) {
          if (!isLoggerRelated) {
            context.report({
              node,
              message: 'Use logger instead of console.*. Available methods: ' +
                customLoggingMethods.filter(m => !m.startsWith('track') && !m.startsWith('measure')).join(', '),
            });
          }
        }
      },

      // Enforce proper logger usage
      ImportDeclaration(node) {
        if (node.source.value.includes('logger')) {
          if (node.specifiers[0]?.type !== 'ImportDefaultSpecifier') {
            context.report({
              node,
              message: 'Logger must be imported as default import',
            });
          }
        }
      },

      // Enforce proper logger method usage
      MemberExpression(node) {
        // Skip all checks for the logger configuration file
        if (isLoggerConfig) {
          return;
        }

        // Skip checking transports
        if (node.object.type === 'MemberExpression' && node.object.property?.name === 'transports') {
          return;
        }

        if (
          node.object.name === 'logger' &&
          !allowedMethods.includes(node.property.name)
        ) {
          context.report({
            node,
            message: 'Invalid logger method. Available methods:\n' +
              '- Direct logging: ' + customLoggingMethods.filter(m => !m.includes('track') && !m.includes('measure')).join(', ') + '\n' +
              '- Helper methods: ' + customLoggingMethods.filter(m => m.includes('track') || m.includes('measure')).join(', '),
          });
        }
      },
    };
  },
}; 