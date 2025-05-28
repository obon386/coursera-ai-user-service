// jest.config.js

process.env.NODE_ENV = 'test';

module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/*.test.js'],
  verbose: true,
  testTimeout: 60000
};