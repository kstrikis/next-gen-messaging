# Testing Strategy

## Test Types and Locations

### 1. Unit Tests

- Location: `server/tests/*.test.js`, `client/src/**/*.test.js`
- Runner: Jest
- Commands:

  ```bash
  # Run all tests (unit, integration, and E2E)
  npm test
  npm run test:all

  # Run only unit tests
  npm run test:unit

  # Server tests
  npm run test:server
  cd server && npm test

  # Client tests
  npm run test:client
  cd client && npm test
  ```

### 2. Integration Tests

- Location: `server/tests/integration/*.test.js`
- Runner: SuperTest with Jest
- Commands:

  ```bash
  # Run integration tests
  npm run test:integration
  cd server && npm run test:integration
  ```

### 3. End-to-End Tests

- Location: `cypress/e2e/**/*.cy.js`
- Runner: Cypress
- Commands:

  ```bash
  # Run all E2E tests
  npm run test:e2e
  npx cypress run

  # Open Cypress UI for development
  npm run test:e2e:open
  npx cypress open
  ```

The E2E test environment is automatically managed by Cypress:

- Server is started in test mode
- Port 3001 is cleaned up if needed
- Test database is used via environment variables
- Server is shut down after tests complete

### 4. Component Tests

- Location: `client/src/components/**/*.stories.js`
- Runner: Storybook
- Commands:

  ```bash
  # Start Storybook
  npm run storybook
  cd client && npm run storybook

  # Build static Storybook
  npm run build-storybook
  cd client && npm run build-storybook
  ```

## Test Database Setup

The test database is automatically created and managed by the PostgreSQL Docker container in our CI environment. This is configured in `.github/workflows/ci.yml`:

```yaml
services:
  postgres:
    image: postgres:latest
    env:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: chatgenius_test
      POSTGRES_HOST_AUTH_METHOD: trust
    ports:
      - 5433:5432
```

For local development:

1. Create a test database:

   ```sql
   CREATE DATABASE chatgenius_test;
   ```

2. Run migrations:
   ```bash
   cd server && DATABASE_URL="postgresql://postgres:postgres@localhost:5433/chatgenius_test?schema=public" npx prisma migrate deploy
   ```

The test database configuration is defined in `.env.test` and `server/.env.test`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/chatgenius_test?schema=public"
```

## Test Coverage Requirements

- Unit Tests: 80% coverage
- Integration Tests: 70% coverage
- E2E Tests: Critical user paths must be covered

Coverage reports are generated when running tests with the `--coverage` flag:

```bash
npm run test:coverage
```

## Running Tests in CI

Tests are automatically run in our CI pipeline for every pull request and push to main. The pipeline:

1. Sets up Node.js and PostgreSQL
2. Installs dependencies
3. Runs linting
4. Runs unit tests
5. Runs integration tests
6. Runs E2E tests
7. Builds the application

You can run the CI pipeline locally using:

```bash
npm run test:local-ci
```

This uses `act` to simulate GitHub Actions locally.

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
    - lint-staged runs related tests
    - eslint
    - prettier

  pre_push:
    - npm run validate (lint + unit tests)

  ci_pipeline:
    - lint
    - unit tests
    - integration tests
    - e2e tests
    - build storybook
```

## Test Environment

```yaml
environment:
  node_version: '22.x'
  database: 'chatgenius_test'
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
    - jest

  e2e_testing:
    - cypress

  component_testing:
    - storybook
    - @storybook/test

  coverage:
    - jest --coverage
    - cypress-coverage

  ci:
    - github actions
    - act (local ci)
```

## Directory Structure

```yaml
test_directories:
  server:
    - tests/*.test.js
    - tests/integration/*.test.js
    - tests/fixtures/

  client:
    - src/**/*.test.js
    - src/**/*.stories.js

  e2e:
    - cypress/e2e/
    - cypress/fixtures/
    - cypress/support/
```
