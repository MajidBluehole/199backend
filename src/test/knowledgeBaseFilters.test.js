const request = require('supertest');
const express = require('express');
const knowledgeBaseRouter = require('../../../src/api/v1/routes/knowledgeBase'); // Assuming router location
const authMiddleware = require('../../../src/api/v1/middleware/auth'); // Assuming auth middleware
const db = require('../../../src/services/db'); // Assuming a db service module

// Mock dependencies
// Mock the DB service to prevent actual DB calls
jest.mock('../../../src/services/db');

// Mock the authentication middleware. By default, it will simulate a successful authentication.
// For specific tests (like 401), we can override this implementation.
jest.mock('../../../src/api/v1/middleware/auth', () => jest.fn((req, res, next) => {
    req.user = { id: 'test-user-id', organization_id: 'test-org-id' };
    next();
}));

// Setup a minimal Express app for testing this specific route
const app = express();
app.use(express.json());
app.use('/api/v1/knowledge-base', knowledgeBaseRouter);

// Add a generic error handler to catch errors passed by `next(err)`
// This mimics a real production setup where a centralized handler manages errors.
app.use((err, req, res, next) => {
    console.error(err); // Optional: log error for debugging during tests
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({ message });
});

describe('GET /api/v1/knowledge-base/filters', () => {

    beforeEach(() => {
        // Reset mocks before each test to ensure test isolation
        jest.clearAllMocks();
        // Restore default auth mock if it was overridden in a test
        authMiddleware.mockImplementation((req, res, next) => {
            req.user = { id: 'test-user-id', organization_id: 'test-org-id' };
            next();
        });
    });

    it('should return 200 with lists of content types, authors, and tags', async () => {
        // Arrange: Setup mock data and DB responses
        const mockContentTypesResult = [
            {
                Type: "enum('article','document','faq','guide')"
            }
        ];
        const mockAuthorsResult = [
            { user_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', name: 'Alice Johnson' },
            { user_id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef1', name: 'Bob Williams' }
        ];
        const mockTagsResult = [
            { name: 'API' },
            { name: 'Onboarding' },
            { name: 'Billing' }
        ];

        db.query.mockImplementation((sql) => {
            if (sql.includes('SHOW COLUMNS FROM knowledge_content')) {
                return Promise.resolve([mockContentTypesResult, []]);
            }
            if (sql.includes('SELECT DISTINCT u.user_id, u.name')) {
                return Promise.resolve([mockAuthorsResult, []]);
            }
            if (sql.includes('SELECT DISTINCT t.name FROM tags t')) {
                return Promise.resolve([mockTagsResult, []]);
            }
            return Promise.resolve([[], []]);
        });

        // Act: Make the API request
        const response = await request(app).get('/api/v1/knowledge-base/filters');

        // Assert: Validate the response
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body).toEqual({
            contentTypes: ['article', 'document', 'faq', 'guide'],
            authors: mockAuthorsResult,
            tags: ['API', 'Onboarding', 'Billing']
        });

        // Assert that the database was queried
        expect(db.query).toHaveBeenCalledTimes(3);
    });

    it('should return 401 Unauthorized if auth middleware rejects the request', async () => {
        // Arrange: Override the auth mock to simulate failure
        authMiddleware.mockImplementation((req, res, next) => {
            res.status(401).json({ message: 'Unauthorized.' });
        });

        // Act
        const response = await request(app).get('/api/v1/knowledge-base/filters');

        // Assert
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: 'Unauthorized.' });
    });

    it('should return 500 Internal Server Error if a database query fails', async () => {
        // Arrange: Mock the DB query to throw an error
        const dbError = new Error('Database connection failed');
        db.query.mockRejectedValue(dbError);

        // Act
        const response = await request(app).get('/api/v1/knowledge-base/filters');

        // Assert
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Internal Server Error' });
    });

    it('should handle empty results from the database gracefully', async () => {
        // Arrange: Mock DB to return empty arrays for authors and tags
        const mockContentTypesResult = [
            {
                Type: "enum('article','document')"
            }
        ];
        db.query.mockImplementation((sql) => {
            if (sql.includes('SHOW COLUMNS FROM knowledge_content')) {
                return Promise.resolve([mockContentTypesResult, []]);
            }
            return Promise.resolve([[], []]); // Return empty for authors and tags
        });

        // Act
        const response = await request(app).get('/api/v1/knowledge-base/filters');

        // Assert
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            contentTypes: ['article', 'document'],
            authors: [],
            tags: []
        });
    });
});