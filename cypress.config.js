import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3001',
    supportFile: false,
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx}',
    video: false,
    screenshotOnRunFailure: false,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
