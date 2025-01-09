export default {
  testEnvironment: 'node',
  testMatch: ['**/tests/integration/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.integration.js'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
} 