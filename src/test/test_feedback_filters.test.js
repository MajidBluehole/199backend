const request = require('supertest');
const app = require('../../src/app'); // Assuming your Express app is exported from src/app.js
const { pool } = require('../../src/database'); // Assuming a mysql2/promise pool is exported

// Mock the database module
jest.mock('../../src/database');

// Mock authentication middleware for simplicity in testing protected routes
// This mock assumes a middleware named 'authenticate' is used for the route.
// A common pattern is to have a middleware that checks for a valid JWT and attaches user info to req.
jest.mock('../../src/middleware/authenticate', () => jest.fn((req, res, next) => {
  // For a valid token, attach a mock user and proceed
  if (req.headers.authorization === 'Bearer valid-token') {
    req.user = { id: 1, organization_id: 1 };
    return next();
  }
  // For an invalid or missing token, send 401
  return res.status(401).json({ message: 'Unauthorized.' });
}));

describe('GET /api/v1/feedback/filters', () => {

  beforeEach(() => {
    // Reset mocks before each test to ensure isolation
    jest.clearAllMocks();
  });

  describe('Successful Retrieval', () => {
    it('should return 200 OK with all filter options', async () => {
      // Arrange: Mock data that the database queries will return
      const mockUsers = [
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Smith' }
      ];
      const mockTags = [
        { id: 101, name: 'bug' },
        { id: 102, name: 'feature-request' }
      ];
      const mockCategories = [
        { category: 'UI/UX' },
        { category: 'Performance' }
      ];
      const mockFeedbackTypes = [
        { type: 'General Feedback' },
        { type: 'Bug Report' }
      ];

      // Mock the implementation of pool.query to simulate database responses
      // The mock will respond differently based on the SQL query it receives.
      pool.query.mockImplementation(sql => {
        if (sql.includes('FROM users')) {
          return Promise.resolve([mockUsers]);
        }
        if (sql.includes('FROM feedback_tags')) {
          return Promise.resolve([mockTags]);
        }
        if (sql.includes('SELECT DISTINCT category FROM feedback')) {
          return Promise.resolve([mockCategories]);
        }
        if (sql.includes('SELECT DISTINCT type FROM feedback')) { // Assuming 'type' is the column for feedbackTypes
          return Promise.resolve([mockFeedbackTypes]);
        }
        return Promise.resolve([[]]);
      });

      // Act: Make the API request with a valid token
      const response = await request(app)
        .get('/api/v1/feedback/filters')
        .set('Authorization', 'Bearer valid-token');

      // Assert: Check the response status and body
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toEqual({
        users: mockUsers,
        categories: ['UI/UX', 'Performance'], // The controller should map the array of objects to an array of strings
        feedbackTypes: ['General Feedback', 'Bug Report'],
        tags: mockTags
      });

      // Assert: Verify that all necessary database queries were made
      expect(pool.query).toHaveBeenCalledWith(expect.stringMatching(/FROM users/));
      expect(pool.query).toHaveBeenCalledWith(expect.stringMatching(/FROM feedback_tags/));
      expect(pool.query).toHaveBeenCalledWith(expect.stringMatching(/SELECT DISTINCT category FROM feedback/));
      expect(pool.query).toHaveBeenCalledWith(expect.stringMatching(/SELECT DISTINCT type FROM feedback/));
      expect(pool.query).toHaveBeenCalledTimes(4);
    });

    it('should return 200 OK with empty arrays if no data exists', async () => {
        // Arrange: Mock empty results from the database
        pool.query.mockResolvedValue([[]]);

        // Act
        const response = await request(app)
            .get('/api/v1/feedback/filters')
            .set('Authorization', 'Bearer valid-token');

        // Assert
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            users: [],
            categories: [],
            feedbackTypes: [],
            tags: []
        });
    });
  });

  describe('Error Scenarios', () => {
    it('should return 401 Unauthorized if no token is provided', async () => {
      // Act: Make the API request without the Authorization header
      const response = await request(app).get('/api/v1/feedback/filters');

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized.');
      expect(pool.query).not.toHaveBeenCalled();
    });

    it('should return 401 Unauthorized if the token is invalid', async () => {
        // Act: Make the API request with an invalid token
        const response = await request(app)
            .get('/api/v1/feedback/filters')
            .set('Authorization', 'Bearer invalid-token');

        // Assert
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Unauthorized.');
        expect(pool.query).not.toHaveBeenCalled();
    });

    it('should return 500 Internal Server Error if the database query fails', async () => {
      // Arrange: Mock a database error
      const dbError = new Error('Database connection failed');
      pool.query.mockRejectedValue(dbError);

      // Act
      const response = await request(app)
        .get('/api/v1/feedback/filters')
        .set('Authorization', 'Bearer valid-token');

      // Assert: Assuming a generic error handler is in place
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Internal Server Error'); // Or a more specific error message
    });
  });
});