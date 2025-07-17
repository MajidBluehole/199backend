const request = require('supertest');
const app = require('../../../app'); // Assuming your Express app is exported from here
const db = require('../../../config/db'); // Assuming a centralized db module for queries
const authMiddleware = require('../../../middleware/auth'); // Assuming a standard auth middleware

// Mock the entire database module
jest.mock('../../../config/db');

// Mock the authentication middleware
// We will override its implementation in specific tests where needed
jest.mock('../../../middleware/auth', () => jest.fn((req, res, next) => {
    // By default, simulate a successfully authenticated user for most tests
    req.user = { id: 123, username: 'test.user', organization_id: 1 };
    next();
}));

describe('GET /api/v1/feedback/reasons', () => {

    // Reset mocks before each test to ensure isolation
    beforeEach(() => {
        jest.clearAllMocks();
        // Restore the default successful auth mock for each test
        authMiddleware.mockImplementation((req, res, next) => {
            req.user = { id: 123, username: 'test.user', organization_id: 1 };
            next();
        });
    });

    describe('Successful Scenarios', () => {
        it('should return 200 OK with a list of active feedback reasons', async () => {
            // Arrange: Mock the database response
            const mockDbResponse = [
                {
                    reason_id: 1,
                    reason_text: 'The information was inaccurate.',
                    is_active: 1
                },
                {
                    reason_id: 2,
                    reason_text: 'This was not helpful for my issue.',
                    is_active: 1
                }
            ];
            db.query.mockResolvedValue([mockDbResponse]);

            // Act: Make the API request
            const response = await request(app)
                .get('/api/v1/feedback/reasons');

            // Assert: Validate the response and behavior
            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toMatch(/json/);
            expect(response.body).toEqual([
                {
                    reason_id: 1,
                    reason_text: 'The information was inaccurate.'
                },
                {
                    reason_id: 2,
                    reason_text: 'This was not helpful for my issue.'
                }
            ]);

            // Assert: Verify that the correct database query was made
            expect(db.query).toHaveBeenCalledTimes(1);
            expect(db.query).toHaveBeenCalledWith(
                expect.stringMatching(/SELECT reason_id, reason_text FROM feedback_reasons WHERE is_active = true/i)
            );
        });

        it('should return 200 OK with an empty array if no active reasons are found', async () => {
            // Arrange: Mock an empty database response
            db.query.mockResolvedValue([[]]);

            // Act: Make the API request
            const response = await request(app)
                .get('/api/v1/feedback/reasons');

            // Assert: Validate the response
            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body.length).toBe(0);

            // Assert: Verify the database was still queried
            expect(db.query).toHaveBeenCalledTimes(1);
        });
    });

    describe('Error Scenarios', () => {
        it('should return 401 Unauthorized when authentication fails', async () => {
            // Arrange: Override the auth mock to simulate failure
            authMiddleware.mockImplementation((req, res, next) => {
                // Simulate the auth middleware sending a 401 response and stopping the chain
                res.status(401).json({ message: 'Unauthorized - User authentication failed.' });
            });

            // Act: Make the API request
            const response = await request(app)
                .get('/api/v1/feedback/reasons');

            // Assert: Validate the error response
            expect(response.status).toBe(401);
            expect(response.body).toEqual({ message: 'Unauthorized - User authentication failed.' });

            // Assert: Ensure the database was not queried due to auth failure
            expect(db.query).not.toHaveBeenCalled();
        });

        it('should return 500 Internal Server Error if the database query fails', async () => {
            // Arrange: Mock a rejected promise from the database
            const dbError = new Error('Database connection error');
            db.query.mockRejectedValue(dbError);

            // Act: Make the API request
            const response = await request(app)
                .get('/api/v1/feedback/reasons');

            // Assert: Validate the server error response
            // This assumes a generic error handler is in place in app.js
            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'An internal server error occurred.' });

            // Assert: Verify that the database query was attempted
            expect(db.query).toHaveBeenCalledTimes(1);
        });
    });
});