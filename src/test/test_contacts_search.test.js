const request = require('supertest');
const app = require('../../../app'); // Assuming your Express app is exported from here
const db = require('../../../lib/db'); // Assuming a database utility module
const authMiddleware = require('../../../middleware/auth'); // Assuming an auth middleware

// Mock the dependencies
jest.mock('../../../lib/db');
jest.mock('../../../middleware/auth');

const mockUser = {
    id: 'user-uuid-1234'
};

const mockContacts = [
    {
        contact_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
        full_name: 'John Doe',
        email: 'john.doe@example.com',
        company_name: 'Example Corp',
        source_system: 'CRM'
    },
    {
        contact_id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef1',
        full_name: 'Jane Smith',
        email: 'jane.smith@acme.com',
        company_name: 'Acme Inc',
        source_system: 'Salesforce'
    }
];

describe('GET /api/v1/contacts/search', () => {

    beforeEach(() => {
        // Clear all mocks before each test to ensure a clean state
        jest.clearAllMocks();

        // By default, mock a successful authentication for most tests
        authMiddleware.mockImplementation((req, res, next) => {
            req.user = mockUser;
            next();
        });
    });

    describe('Success Scenarios', () => {
        it('should return 200 and a list of matching contacts', async () => {
            const searchQuery = 'John';
            const queryParam = `%${searchQuery}%`;
            // Mock the database to return one matching contact
            db.pool = { query: jest.fn().mockResolvedValue([mockContacts.slice(0, 1)]) };

            const response = await request(app)
                .get(`/api/v1/contacts/search?q=${searchQuery}`);

            expect(response.statusCode).toBe(200);
            expect(response.headers['content-type']).toMatch(/json/);
            expect(response.body).toEqual([mockContacts[0]]);

            // Verify the database was queried correctly
            expect(db.pool.query).toHaveBeenCalledTimes(1);
            expect(db.pool.query).toHaveBeenCalledWith(
                expect.stringContaining('FROM contacts WHERE user_id = ?'),
                [mockUser.id, queryParam, queryParam, queryParam, 10] // Default limit is 10
            );
        });

        it('should return 200 and respect the provided limit', async () => {
            const searchQuery = 'a';
            const limit = 5;
            const queryParam = `%${searchQuery}%`;
            db.pool = { query: jest.fn().mockResolvedValue([mockContacts]) };

            const response = await request(app)
                .get(`/api/v1/contacts/search?q=${searchQuery}&limit=${limit}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.length).toBe(mockContacts.length);

            expect(db.pool.query).toHaveBeenCalledTimes(1);
            expect(db.pool.query).toHaveBeenCalledWith(
                expect.any(String),
                [mockUser.id, queryParam, queryParam, queryParam, limit]
            );
        });

        it('should return 200 and an empty array if no contacts are found', async () => {
            const searchQuery = 'nonexistent';
            db.pool = { query: jest.fn().mockResolvedValue([[]]) };

            const response = await request(app)
                .get(`/api/v1/contacts/search?q=${searchQuery}`);

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual([]);
            expect(db.pool.query).toHaveBeenCalledTimes(1);
        });
    });

    describe('Error Scenarios', () => {
        it('should return 400 Bad Request if the `q` query parameter is missing', async () => {
            const response = await request(app).get('/api/v1/contacts/search');

            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({ message: "Bad Request - Missing required query parameter 'q'." });
            // The database should not be queried if validation fails
            expect(db.pool.query).not.toHaveBeenCalled();
        });

        it('should return 401 Unauthorized if the auth token is missing or invalid', async () => {
            // Override the default auth mock to simulate failure
            authMiddleware.mockImplementation((req, res, next) => {
                res.status(401).json({ message: 'Unauthorized - Authentication token is missing or invalid.' });
            });

            const response = await request(app).get('/api/v1/contacts/search?q=test');

            expect(response.statusCode).toBe(401);
            expect(response.body).toEqual({ message: 'Unauthorized - Authentication token is missing or invalid.' });
            expect(db.pool.query).not.toHaveBeenCalled();
        });

        it('should return 500 Internal Server Error if the database query fails', async () => {
            const dbError = new Error('Database connection lost');
            db.pool = { query: jest.fn().mockRejectedValue(dbError) };

            const response = await request(app).get('/api/v1/contacts/search?q=test');

            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual({ message: 'An internal server error occurred.' }); // Assuming a generic error handler middleware
            expect(db.pool.query).toHaveBeenCalledTimes(1);
        });
    });
});