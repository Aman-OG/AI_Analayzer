// server/__tests__/setup.js

/**
 * Global test setup for Jest
 * This file runs before all tests
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.RATE_LIMIT_MAX_REQUESTS = '100';

// Increase timeout for integration tests
jest.setTimeout(10000);

// Suppress console logs during tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

// Mock Date.now() for consistent timestamps in tests
const mockDate = new Date('2024-01-01T00:00:00.000Z');
global.Date.now = jest.fn(() => mockDate.getTime());

console.log('Test environment initialized');
