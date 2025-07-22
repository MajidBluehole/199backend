const request = require('supertest');
const app = require('../../src/app'); // Assuming main express app is exported from src/app.js
const db = require('../../src/database/mysql'); // Assuming a mysql connection utility
const authMiddleware = require('../../src/middleware/auth'); // Assuming an auth middleware

// Mock the dependencies
jest.mock('../../src/database/mysql');
jest.mock('../../src/middleware/auth');

describe('GET /api/v1/system/connections', () => {
  const mockOrganizationId = 'org-a1b2c3d4-e5f6-7890-1234-567890abcdef';

  beforeEach(() => {
    // Reset mocks before each test to ensure a clean state
    jest.clearAllMocks();

    // By default, mock a successful authentication for all tests in this suite
    // This simulates a valid user being logged in.
    authMiddleware.mockImplementation((req, res, next) => {
      req.user = { organization_id: mockOrganizationId };
      next();
    });
  });

  test('should return 200 and a list of system connections for an authenticated user', async () => {
    const mockConnections = [
      { system_type: 'CRM', status: 'connected' },
      { system_type: 'Email', status: 'disconnected' },
      { system_type: 'Slack', status: 'pending' },
    ];

    // Mock the database query to return the sample data
    db.promise().query.mockResolvedValue([mockConnections]);

    const response = await request(app).get('/api/v1/system/connections');

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.body).toEqual(mockConnections);

    // Verify that the database was queried with the correct organization ID
    expect(db.promise().query).toHaveBeenCalledTimes(1);
    expect(db.promise().query).toHaveBeenCalledWith(
      'SELECT system_type, status FROM connected_systems WHERE organization_id = ?',
      [mockOrganizationId]
    );
  });

  test('should return 200 and an empty array if no connections are found for the organization', async () => {
    // Mock the database to return an empty result set
    db.promise().query.mockResolvedValue([[]]);

    const response = await request(app).get('/api/v1/system/connections');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);

    // Verify the database was still queried
    expect(db.promise().query).toHaveBeenCalledTimes(1);
    expect(db.promise().query).toHaveBeenCalledWith(
      'SELECT system_type, status FROM connected_systems WHERE organization_id = ?',
      [mockOrganizationId]
    );
  });

  test('should return 500 if a database error occurs', async () => {
    const dbError = new Error('Database connection failed');
    // Mock the database query to reject with an error
    db.promise().query.mockRejectedValue(dbError);

    const response = await request(app).get('/api/v1/system/connections');

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ message: 'Internal Server Error' }); // Assuming a generic error handler middleware
  });

  describe('Authentication Scenarios', () => {
    test('should return 401 Unauthorized if authentication middleware fails', async () => {
      // For this specific test, override the default successful auth mock
      const authErrorMessage = 'Unauthorized - Authentication token is missing or invalid.';
      authMiddleware.mockImplementation((req, res, next) => {
        res.status(401).json({ message: authErrorMessage });
      });

      const response = await request(app).get('/api/v1/system/connections');

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe(authErrorMessage);

      // Ensure that the database was not queried in case of an auth failure
      expect(db.promise().query).not.toHaveBeenCalled();
    });
  });
});