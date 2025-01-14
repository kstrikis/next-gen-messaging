// Set up environment variables for testing
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

// Increase timeout for tests
jest.setTimeout(2000);

// Mock console.error and console.warn to keep test output clean
global.console.error = jest.fn();
global.console.warn = jest.fn();

// Clean up after all tests
afterAll(async () => {
  // Add any cleanup needed (e.g., close database connections)
});
