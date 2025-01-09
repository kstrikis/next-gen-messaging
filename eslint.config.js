import globals from 'globals';
import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import prettierConfig from 'eslint-config-prettier';
import storybookPlugin from 'eslint-plugin-storybook';
import cypressPlugin from 'eslint-plugin-cypress';

export default [
  js.configs.recommended,
  {
    ignores: [
      '**/node_modules/**',
      '**/build/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.next/**',
      '**/storybook-static/**',
      '**/*.min.js',
      '**/vendor/**',
      '**/public/**',
    ],
  },
  {
    files: ['**/*.{js,jsx,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        ...globals.jest,
        ...cypressPlugin.environments.globals.globals,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
      import: importPlugin,
      storybook: storybookPlugin,
      cypress: cypressPlugin,
    },
    rules: {
      // Airbnb style rules
      'no-var': 'error',
      'prefer-const': 'error',
      'no-unused-vars': 'error',
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'comma-dangle': ['error', 'always-multiline'],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'indent': ['error', 2],
      'arrow-spacing': ['error', { before: true, after: true }],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'space-before-function-paren': ['error', {
        anonymous: 'always',
        named: 'never',
        asyncArrow: 'always'
      }],
      'space-before-blocks': ['error', 'always'],
      'keyword-spacing': ['error', { before: true, after: true }],
      'eol-last': ['error', 'always'],
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
      'import/prefer-default-export': 'off',
      
      // React specific rules
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...jsxA11yPlugin.configs.recommended.rules,
      ...importPlugin.configs.recommended.rules,
      ...storybookPlugin.configs.recommended.rules,
      ...cypressPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/no-unknown-property': ['error', { ignore: ['jsx', 'global', 'cmdk-input-wrapper'] }],
      'react/no-unescaped-entities': 'off',
    },
    settings: {
      react: {
        version: '18.2.0',
      },
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx'],
        },
        alias: {
          map: [
            ['@', './client/src']
          ],
          extensions: ['.js', '.jsx']
        }
      },
      next: {
        rootDir: 'client',
      },
    },
  },
  {
    files: ['server/**/*.js'],
    rules: {
      'no-console': 'off',
    },
  },
  prettierConfig,
];
