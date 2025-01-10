import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    env: {
      apiUrl: 'http://localhost:3001',
      wsUrl: 'ws://localhost:3001',
    },
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    watchForFileChanges: false,
    experimentalRunAllSpecs: true,
    groups: {
      ui: 'cypress/e2e/ui/**/*.cy.{js,jsx}',
      api: 'cypress/e2e/api/**/*.cy.{js,jsx}',
      integration: 'cypress/e2e/integration/**/*.cy.{js,jsx}'
    }
  }
});
