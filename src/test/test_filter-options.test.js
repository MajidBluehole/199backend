const request = require('supertest');
const app = require('../../../../src/app'); // Assuming your Express app is exported from here
const db = require('../../../../src/config/db'); // Assuming your DB connection pool is exported from here

// Mock the entire database module
// This prevents any real database calls from being made during tests.
jest.mock('../../../../src/config/db');

describe('GET /api/v1/admin/filter-options', () => {

  // Reset mocks before each test to ensure test isolation
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful Scenarios', () => {
    test('should return 200 OK with grouped filter options when data exists', async () => {
      // Arrange: Mock database response with multiple categories
      const mockDbResponse = [
        {
          id: 'c8b2a1e0-5b8f-4b6e-8f4a-1e2c3d4b5a6b',
          category_name: 'Content Source',
          value: 'Internal',
          display_order: 1
        },
        {
          id: 'd9c3b2f1-6c9g-5c7f-9g5b-2f3d4e5b6c7d',
          category_name: 'Content Source',
          value: 'External',
          display_order: 2
        },
        {
          id: 'a6b7c8d9-e0f1-2a3b-4c5d-6e7f8a9b0c1d',
          category_name: 'Interaction Type',
          value: 'Call',
          display_order: 1
        },
        {
          id: 'b7c8d9e0-f1a2-3b4c-5d6e-7f8a9b0c1d2e',
          category_name: 'Interaction Type',
          value: 'Email',
          display_order: 2
        },
        {
          id: 'e8f9a0b1-c2d3-4e5f-6a7b-8c9d0e1f2a3b',
          category_name: 'Tag',
          value: 'Urgent',
          display_order: 1
        }
      ];

      // Mock the implementation of the database query to return our test data
      db.promise().query.mockResolvedValue([mockDbResponse]);

      // Act: Make the API request
      const response = await request(app).get('/api/v1/admin/filter-options');

      // Assert: Check the response
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/json/);

      // Assert: Check that the response body is correctly grouped and structured
      expect(response.body).toEqual([
        {
          category_name: 'Content Source',
          values: [
            {
              id: 'c8b2a1e0-5b8f-4b6e-8f4a-1e2c3d4b5a6b',
              value: 'Internal',
              display_order: 1
            },
            {
              id: 'd9c3b2f1-6c9g-5c7f-9g5b-2f3d4e5b6c7d',
              value: 'External',
              display_order: 2
            }
          ]
        },
        {
          category_name: 'Interaction Type',
          values: [
            {
              id: 'a6b7c8d9-e0f1-2a3b-4c5d-6e7f8a9b0c1d',
              value: 'Call',
              display_order: 1
            },
            {
              id: 'b7c8d9e0-f1a2-3b4c-5d6e-7f8a9b0c1d2e',
              value: 'Email',
              display_order: 2
            }
          ]
        },
        {
          category_name: 'Tag',
          values: [
            {
              id: 'e8f9a0b1-c2d3-4e5f-6a7b-8c9d0e1f2a3b',
              value: 'Urgent',
              display_order: 1
            }
          ]
        }
      ]);

      // Assert: Ensure the database was queried correctly
      expect(db.promise().query).toHaveBeenCalledTimes(1);
      expect(db.promise().query).toHaveBeenCalledWith(expect.stringContaining('SELECT id, value, display_order, category_name FROM filter_options'));
    });

    test('should return 200 OK with an empty array if no filter options are in the database', async () => {
      // Arrange: Mock an empty database response
      db.promise().query.mockResolvedValue([[]]);

      // Act: Make the API request
      const response = await request(app).get('/api/v1/admin/filter-options');

      // Assert: Check the response
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
      expect(db.promise().query).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Scenarios', () => {
    test('should return 500 Internal Server Error if the database query fails', async () => {
      // Arrange: Mock the database query to reject with an error
      const dbError = new Error('Database connection lost');
      db.promise().query.mockRejectedValue(dbError);

      // Act: Make the API request
      const response = await request(app).get('/api/v1/admin/filter-options');

      // Assert: Check the error response
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: 'An error occurred while fetching filter options.'
      });
      expect(db.promise().query).toHaveBeenCalledTimes(1);
    });
  });
});