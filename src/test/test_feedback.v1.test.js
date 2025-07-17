const request = require('supertest');
const app = require('../../../app'); // Assuming your Express app is exported from here
const db = require('../../../database/mysql'); // Assuming a db module for executing queries

// Mock the database module
jest.mock('../../../database/mysql');

// Mock authentication middleware
jest.mock('../../../middleware/auth', () => jest.fn((req, res, next) => {
  req.user = { id: 'test-user-id', organizationId: 'test-org-id' };
  next();
}));

describe('GET /api/v1/feedback', () => {
  let mockFeedbackData;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Common mock data for successful responses
    mockFeedbackData = [
      {
        id: 'fb_1',
        comment: 'This is a great feature!',
        feedback_type: 'suggestion',
        status: 'reviewed',
        created_at: '2023-10-26T10:00:00.000Z',
        user_id: 'user_1',
        user_name: 'Alice Smith',
        tags: 'UI,UX'
      },
      {
        id: 'fb_2',
        comment: 'Found a bug on the dashboard.',
        feedback_type: 'bug',
        status: 'open',
        created_at: '2023-10-25T12:30:00.000Z',
        user_id: 'user_2',
        user_name: 'Bob Johnson',
        tags: 'bug,dashboard'
      },
      {
        id: 'fb_3',
        comment: 'This user was deleted.',
        feedback_type: 'general',
        status: 'closed',
        created_at: '2023-10-24T14:00:00.000Z',
        user_id: 'user_3_deleted',
        user_name: 'Deleted User', // Testing the COALESCE functionality
        tags: null
      }
    ];
  });

  describe('Successful Responses', () => {
    it('should return a paginated list of feedback with default parameters', async () => {
      const mockTotalCount = [{ 'COUNT(*)': 3 }];
      db.query.mockResolvedValue([mockTotalCount, mockFeedbackData]);

      const response = await request(app).get('/api/v1/feedback');

      expect(response.status).toBe(200);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.pagination).toEqual({
        page: 1,
        limit: 20,
        totalItems: 3,
        totalPages: 1
      });
      expect(response.body.data.length).toBe(3);
      expect(response.body.data[0].comment).toBe('This is a great feature!');

      // Verify the query was called with default sorting and pagination
      expect(db.query.mock.calls[0][0]).toContain('ORDER BY f.created_at desc');
      expect(db.query.mock.calls[0][0]).toContain('LIMIT 20 OFFSET 0');
    });

    it('should handle custom pagination parameters', async () => {
      const mockTotalCount = [{ 'COUNT(*)': 10 }];
      db.query.mockResolvedValue([mockTotalCount, mockFeedbackData.slice(0, 2)]);

      const response = await request(app).get('/api/v1/feedback?page=2&limit=2');

      expect(response.status).toBe(200);
      expect(response.body.pagination).toEqual({
        page: 2,
        limit: 2,
        totalItems: 10,
        totalPages: 5
      });
      expect(db.query.mock.calls[0][0]).toContain('LIMIT 2 OFFSET 2');
    });

    it('should handle custom sorting parameters', async () => {
      const mockTotalCount = [{ 'COUNT(*)': 3 }];
      db.query.mockResolvedValue([mockTotalCount, mockFeedbackData]);

      await request(app).get('/api/v1/feedback?sortBy=status&sortOrder=asc');

      expect(db.query.mock.calls[0][0]).toContain('ORDER BY f.status asc');
    });

    it('should filter by search term', async () => {
      const mockTotalCount = [{ 'COUNT(*)': 1 }];
      db.query.mockResolvedValue([mockTotalCount, [mockFeedbackData[1]]]);

      const response = await request(app).get('/api/v1/feedback?search=bug');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].comment).toContain('bug');
      expect(db.query.mock.calls[0][0]).toContain('f.comment LIKE ?');
      expect(db.query.mock.calls[0][1]).toContain('%bug%');
    });

    it('should filter by date range', async () => {
      db.query.mockResolvedValue([[{ 'COUNT(*)': 2 }], mockFeedbackData.slice(0, 2)]);

      await request(app).get('/api/v1/feedback?startDate=2023-10-25&endDate=2023-10-26');

      const queryParams = db.query.mock.calls[0][1];
      expect(db.query.mock.calls[0][0]).toContain('f.created_at >= ?');
      expect(db.query.mock.calls[0][0]).toContain('f.created_at <= ?');
      expect(queryParams).toContain('2023-10-25');
      expect(queryParams).toContain('2023-10-26 23:59:59'); // Check that end date includes the whole day
    });

    it('should filter by multiple statuses and user IDs', async () => {
      db.query.mockResolvedValue([[{ 'COUNT(*)': 2 }], mockFeedbackData.slice(0, 2)]);

      await request(app).get('/api/v1/feedback?status=open&status=reviewed&userId=user_1&userId=user_2');

      const query = db.query.mock.calls[0][0];
      const params = db.query.mock.calls[0][1];
      expect(query).toContain('f.status IN (?)');
      expect(query).toContain('f.user_id IN (?)');
      expect(params).toEqual(expect.arrayContaining([['open', 'reviewed'], ['user_1', 'user_2']]));
    });

    it('should correctly display `Deleted User` for feedback with null user', async () => {
      const mockTotalCount = [{ 'COUNT(*)': 1 }];
      db.query.mockResolvedValue([mockTotalCount, [mockFeedbackData[2]]]);

      const response = await request(app).get('/api/v1/feedback?search=deleted');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].user_name).toBe('Deleted User');
    });
  });

  describe('Error Responses', () => {
    it('should return 400 for invalid sortBy column', async () => {
      const response = await request(app).get('/api/v1/feedback?sortBy=invalid_column');

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid sort parameter');
    });

    it('should return 400 for invalid sortOrder value', async () => {
      const response = await request(app).get('/api/v1/feedback?sortOrder=descending');

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid sort order');
    });

    it('should return 400 for non-integer page number', async () => {
      const response = await request(app).get('/api/v1/feedback?page=abc');

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid page number');
    });

    it('should return 400 for invalid date format', async () => {
      const response = await request(app).get('/api/v1/feedback?startDate=not-a-date');

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid date format');
    });

    it('should return 401 if user is not authenticated', async () => {
      // Unmock and re-mock the auth middleware to simulate failure
      jest.unmock('../../../middleware/auth');
      jest.mock('../../../middleware/auth', () => jest.fn((req, res, next) => {
        // Simulate authentication failure by not calling next() and sending a 401
        res.status(401).json({ message: 'Unauthorized.' });
      }));

      const response = await request(app).get('/api/v1/feedback');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized.');
    });

    it('should handle database errors gracefully', async () => {
      db.query.mockRejectedValue(new Error('DB connection failed'));

      const response = await request(app).get('/api/v1/feedback');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('An internal server error occurred.');
    });
  });
});