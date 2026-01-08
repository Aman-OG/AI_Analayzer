// server/__tests__/helpers/testHelpers.js

/**
 * Test helper utilities for backend tests
 */

const mongoose = require('mongoose');

/**
 * Create a valid MongoDB ObjectId
 */
function createObjectId() {
    return new mongoose.Types.ObjectId();
}

/**
 * Wait for a condition to be true
 */
async function waitFor(condition, timeout = 5000, interval = 100) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        if (await condition()) {
            return true;
        }
        await new Promise(resolve => setTimeout(resolve, interval));
    }

    throw new Error('Timeout waiting for condition');
}

/**
 * Clean all collections in the database
 */
async function cleanDatabase() {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
        await collections[key].deleteMany({});
    }
}

/**
 * Create a mock Express request
 */
function createMockRequest(overrides = {}) {
    return {
        body: {},
        params: {},
        query: {},
        headers: {},
        user: null,
        file: null,
        files: null,
        ...overrides,
    };
}

/**
 * Create a mock Express response
 */
function createMockResponse() {
    const res = {
        statusCode: 200,
        data: null,
    };

    res.status = jest.fn((code) => {
        res.statusCode = code;
        return res;
    });

    res.json = jest.fn((data) => {
        res.data = data;
        return res;
    });

    res.send = jest.fn((data) => {
        res.data = data;
        return res;
    });

    res.set = jest.fn();
    res.setHeader = jest.fn();

    return res;
}

/**
 * Create a mock next function
 */
function createMockNext() {
    return jest.fn();
}

/**
 * Assert that a response has a specific status code
 */
function expectStatus(res, statusCode) {
    expect(res.statusCode).toBe(statusCode);
}

/**
 * Assert that a response contains specific data
 */
function expectResponseData(res, data) {
    expect(res.data).toMatchObject(data);
}

module.exports = {
    createObjectId,
    waitFor,
    cleanDatabase,
    createMockRequest,
    createMockResponse,
    createMockNext,
    expectStatus,
    expectResponseData,
};
