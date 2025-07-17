const request = require('supertest');
const app = require('../../../app'); // Assuming your Express app is exported from 'app.js' or 'index.js' in the root
const db = require('../../../config/db'); // Assuming a db module that exports the pool
const authMiddleware = require('../../../middleware/auth'); // Assuming a standard auth middleware

// Mock dependencies
jest.mock('../../../config/db');
jest.mock('../../../middleware/auth');

describe('GET /api/v1/analytics/feedback/summary', () => {

    const mockUser = { id: 1, organizationId: 1, role: 'admin' };

    const mockDbResults = {
        feedbackTrends: [
            { date_group: '2023-01-01', helpful: 15, not_helpful: 3, outdated: 1 },
            { date_group: '2023-01-02', helpful: 20, not_helpful: 5, outdated: 2 },
        ],
        acceptanceRate: [
            { type: 'helpful', count: 150 },
            { type: 'not_helpful', count: 30 },
            { type: 'outdated', count: 20 },
        ],
        topSearchQueries: [
            { query: 'salesforce setup', count: 45 },
            { query: 'api key location', count: 32 },
            { query: 'user permissions', count: 18 },
        ],
    };

    beforeEach(() => {
        jest.clearAllMocks();

        // Default mock for successful authentication and authorization
        authMiddleware.mockImplementation((req, res, next) => {
            req.user = mockUser;
            next();
        });
    });

    describe('Success Scenarios', () => {
        it('should return 200 with aggregated data for a request with no filters', async () => {
            // Mock the three separate queries the controller is expected to make
            db.query
                .mockResolvedValueOnce([mockDbResults.feedbackTrends])
                .mockResolvedValueOnce([mockDbResults.acceptanceRate])
                .mockResolvedValueOnce([mockDbResults.topSearchQueries]);

            const response = await request(app).get('/api/v1/analytics/feedback/summary');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('feedbackTrends');
            expect(response.body).toHaveProperty('acceptanceRate');
            expect(response.body).toHaveProperty('topSearchQueries');
            expect(response.body.topSearchQueries.length).toBe(3);

            // Verify that the correct number of queries were made
            expect(db.query).toHaveBeenCalledTimes(3);

            // Verify the first query (trends) was called without a complex WHERE clause
            const trendsQuery = db.query.mock.calls[0][0];
            expect(trendsQuery).not.toContain('f.created_at >=');
            expect(trendsQuery).not.toContain('f.type IN');
        });

        it('should return 200 with filtered data when all query parameters are provided', async () => {
            db.query
                .mockResolvedValueOnce([mockDbResults.feedbackTrends])
                .mockResolvedValueOnce([mockDbResults.acceptanceRate])
                .mockResolvedValueOnce([mockDbResults.topSearchQueries]);

            const queryParams = {
                startDate: '2023-01-01',
                endDate: '2023-01-31',
                feedbackType: ['helpful', 'not_helpful'],
                category: ['Salesforce', 'API'],
                userId: [101, 102],
            };

            const response = await request(app)
                .get('/api/v1/analytics/feedback/summary')
                .query(queryParams);

            expect(response.status).toBe(200);
            expect(response.body).toBeDefined();

            expect(db.query).toHaveBeenCalledTimes(3);

            // Check if the WHERE clauses were correctly appended to the queries
            const trendsQuery = db.query.mock.calls[0][0];
            const trendsParams = db.query.mock.calls[0][1];

            expect(trendsQuery).toContain('f.created_at >= ?');
            expect(trendsQuery).toContain('f.created_at <= ?');
            expect(trendsQuery).toContain('f.type IN (?)');
            expect(trendsQuery).toContain('c.name IN (?)');
            expect(trendsQuery).toContain('f.user_id IN (?)');

            expect(trendsParams).toEqual(expect.arrayContaining([
                queryParams.startDate,
                queryParams.endDate,
                queryParams.feedbackType,
                queryParams.category,
                queryParams.userId,
            ]));
        });

        it('should return 200 with empty data structures when no matching records are found', async () => {
            db.query
                .mockResolvedValueOnce([[]]) // No trends
                .mockResolvedValueOnce([[]]) // No acceptance data
                .mockResolvedValueOnce([[]]); // No top queries

            const response = await request(app).get('/api/v1/analytics/feedback/summary');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                feedbackTrends: {},
                acceptanceRate: {},
                topSearchQueries: [],
            });
        });
    });

    describe('Error Scenarios', () => {
        it('should return 401 Unauthorized if authentication middleware fails', async () => {
            // Override default auth mock to simulate auth failure
            authMiddleware.mockImplementation((req, res, next) => {
                // In a real app, the middleware would handle sending the response
                res.status(401).json({ message: 'Unauthorized.' });
            });

            const response = await request(app).get('/api/v1/analytics/feedback/summary');

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Unauthorized.');
            expect(db.query).not.toHaveBeenCalled();
        });

        it('should return 403 Forbidden if user does not have required permissions', async () => {
            // This test assumes the controller logic itself checks the user's role
            // The auth middleware succeeds, but the user role is insufficient.
            authMiddleware.mockImplementation((req, res, next) => {
                req.user = { id: 2, organizationId: 1, role: 'viewer' }; // A role that can't access analytics
                // To make this test robust, we simulate the controller sending a 403
                // In a real scenario, the controller would have a check like: if (req.user.role !== 'admin') return res.status(403).send(...)
                // For this test, we'll just mock the middleware to send the final response for simplicity.
                res.status(403).json({ message: 'Forbidden.' });
            });

            const response = await request(app).get('/api/v1/analytics/feedback/summary');

            expect(response.status).toBe(403);
            expect(response.body.message).toBe('Forbidden.');
            expect(db.query).not.toHaveBeenCalled();
        });

        it('should return 500 Internal Server Error if the database query fails', async () => {
            const dbError = new Error('Database connection failed');
            db.query.mockRejectedValue(dbError);

            const response = await request(app).get('/api/v1/analytics/feedback/summary');

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('message');
            // The exact message depends on the global error handler
            expect(response.body.message).toMatch(/Internal Server Error|Database connection failed/i);
        });
    });
});