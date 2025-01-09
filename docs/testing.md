# Testing Strategy

## Test Types and Locations

### 1. Unit Tests

- Location: `server/tests/*.test.js`, `client/src/**/*.test.js`
- Runner: Jest
- Command: `npm test`
- Individual Commands:

  ```bash
  # Server tests
  npm run test:server
  npm run test:server:watch
  npm run test:server:coverage

  # Client tests
  npm run test:client
  npm run test:client:watch
  npm run test:client:coverage
  ```

### 2. Integration Tests

- Location: `server/tests/integration/*.test.js`
- Runner: SuperTest
- Command: `npm run test:integration`

### 3. End-to-End Tests

- Location: `cypress/e2e/**/*.cy.js`
- Runner: Cypress
- Commands:

  ```bash
  # Run all E2E tests
  ./scripts/test-e2e.sh

  # Open Cypress UI
  npx cypress open
  ```

### 4. Component Tests

- Location: `client/src/components/**/*.stories.js`
- Runner: Storybook
- Commands:

  ```bash
  # Start Storybook
  cd client && npm run storybook

  # Build static Storybook
  cd client && npm run build-storybook
  ```

## Coverage Requirements

```yaml
minimum_coverage:
  statements: 80
  branches: 75
  functions: 80
  lines: 80
```

## Test File Naming

```yaml
naming_conventions:
  unit_tests: '{name}.test.js'
  integration_tests: '{name}.integration.test.js'
  e2e_tests: '{name}.cy.js'
  component_tests: '{name}.stories.js'
```

## When to Run Tests

```yaml
test_execution:
  pre_commit:
    - unit_tests
    - lint

  pre_push:
    - unit_tests
    - integration_tests
    - build

  ci_pipeline:
    - unit_tests
    - integration_tests
    - e2e_tests
    - build_storybook
```

## Test Environment

```yaml
environment:
  node_version: '22.x'
  database: 'test_db'
  env_file: '.env.test'
```

## Testing Stack

```yaml
tools:
  unit_testing:
    - jest
    - @testing-library/react
    - @testing-library/user-event

  integration_testing:
    - supertest

  e2e_testing:
    - cypress

  component_testing:
    - storybook
    - @storybook/test

  coverage:
    - jest --coverage
    - cypress-coverage
```

## Directory Structure

```yaml
test_directories:
  server:
    - tests/unit/
    - tests/integration/
    - tests/fixtures/

  client:
    - src/**/*.test.js
    - src/**/*.stories.js

  e2e:
    - cypress/e2e/
    - cypress/fixtures/
    - cypress/support/
```
