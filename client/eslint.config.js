import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      'no-console': ['error', { allow: ['warn', 'error', 'info', 'debug', 'group', 'groupEnd'] }],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
    overrides: [
      {
        files: ['src/lib/logger.js'],
        rules: {
          'no-console': 'off',
        },
      },
    ],
  },
]; 