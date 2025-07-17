const request = require('supertest');
const express = require('express');
const knowledgeContentRouter = require('../../../routes/v1/knowledge-base/content'); // Assuming the router is exported
const authMiddleware = require('../../../middleware/auth'); // Mockable auth middleware

// Mock the database connection pool
const db = require('../config/database'); // Assuming a db utility file
jest.mock('../../../config/db');

// Mock the authentication middleware
jest.mock('../../../middleware/auth', () => jest.fn((req, res, next) => {
  req.user = { id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' }; // Mock user
  next();
}));

const app = express();
app.use(express.json());
app.use('/api/v1/knowledge-base/content', knowledgeContentRouter);

// Mock data for the tests
const mockContent = [
  {
    content_id: 'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
    title: 'Introduction to Node.js',
    description: 'A comprehensive guide to getting started with Node.js.',
    content_type: 'Article',
    file_name: null,
    file_size: null,
    view_count: 150,
    download_count: 50,
    created_at: '2023-10-27T10:00:00.000Z',
    user_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    user_name: 'John Doe',
    tags: 'node,javascript,backend'
  },
  {
    content_id: 'd1e2f3a4-b5c6-a7b8-c9d0-e1f2a3b4c5d6',
    title: 'Advanced MySQL Techniques',
    description: 'Deep dive into MySQL performance and optimization.',
    content_type: 'Whitepaper',
    file_name: 'mysql_advanced.pdf',
    file_size: 2048000,
    view_count: 100,
    download_count: 75,
    created_at: '2023-09-15T14:30:00.000Z',
    user_id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef1',
    user_name: 'Jane Smith',
    tags: 'mysql,database,performance'
  }
];

describe('GET /api/v1/knowledge-base/content', () => {
  beforeEach(() => {
    // Reset mocks before each test
    db.query.mockClear();
    authMiddleware.mockClear();
  });

  describe('Authentication', () => {
    it('should return 401 Unauthorized if authentication fails', async () => {
      // Override the mock for this specific test
      authMiddleware.mockImplementationOnce((req, res, next) => {
        return res.status(401).json({ message: 'Unauthorized - Authentication token is missing or invalid.' });
      });

      const response = await request(app).get('/api/v1/knowledge-base/content');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized - Authentication token is missing or invalid.');
    });
  });

  describe('Successful Requests', () => {
    it('should return a list of content with default parameters', async () => {
      db.query
        .mockResolvedValueOnce([mockContent]) // Data query
        .mockResolvedValueOnce([[{ total: 2 }]]); // Count query

      const response = await request(app).get('/api/v1/knowledge-base/content');

      expect(response.status).toBe(200);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(20);
      expect(response.body.total_results).toBe(2);
      expect(response.body.total_pages).toBe(1);
      expect(response.body.results).toHaveLength(2);
      expect(response.body.results[0].title).toBe('Introduction to Node.js');
      expect(response.body.results[0].tags).toEqual(['node', 'javascript', 'backend']);
      expect(db.query.mock.calls[0][0]).toContain('ORDER BY relevance DESC');
      expect(db.query.mock.calls[0][0]).toContain('LIMIT 20 OFFSET 0');
    });

    it('should handle search, filtering, sorting, and pagination', async () => {
      db.query
        .mockResolvedValueOnce([mockContent.slice(0, 1)]) // Data query
        .mockResolvedValueOnce([[{ total: 1 }]]); // Count query

      const queryParams = {
        search: 'Node.js',
        contentType: 'Article',
        authorId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
        tags: 'node,backend',
        startDate: '2023-10-01',
        endDate: '2023-10-31',
        sortBy: 'popularity',
        sortOrder: 'asc',
        page: 1,
        limit: 5
      };

      const response = await request(app)
        .get('/api/v1/knowledge-base/content')
        .query(queryParams);

      expect(response.status).toBe(200);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(5);
      expect(response.body.total_results).toBe(1);
      expect(response.body.results).toHaveLength(1);

      const sqlQuery = db.query.mock.calls[0][0];
      expect(sqlQuery).toContain('MATCH(kc.title, kc.description) AGAINST (? IN BOOLEAN MODE)');
      expect(sqlQuery).toContain('kc.content_type = ?');
      expect(sqlQuery).toContain('u.user_id = ?');
      expect(sqlQuery).toContain('t.name IN (?)');
      expect(sqlQuery).toContain('kc.created_at >= ?');
      expect(sqlQuery).toContain('kc.created_at <= ?');
      expect(sqlQuery).toContain('ORDER BY popularity ASC');
      expect(sqlQuery).toContain('LIMIT 5 OFFSET 0');
    });

    it('should return an empty array when no content matches the criteria', async () => {
      db.query
        .mockResolvedValueOnce([[]]) // Empty data array
        .mockResolvedValueOnce([[{ total: 0 }]]); // Zero count

      const response = await request(app)
        .get('/api/v1/knowledge-base/content')
        .query({ search: 'nonexistent content' });

      expect(response.status).toBe(200);
      expect(response.body.total_results).toBe(0);
      expect(response.body.results).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    it('should return 400 for an invalid sortBy parameter', async () => {
      const response = await request(app)
        .get('/api/v1/knowledge-base/content')
        .query({ sortBy: 'invalidColumn' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid sortBy parameter');
    });

    it('should return 400 for an invalid sortOrder parameter', async () => {
      const response = await request(app)
        .get('/api/v1/knowledge-base/content')
        .query({ sortOrder: 'diagonal' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid sortOrder parameter');
    });

    it('should return 400 for a non-UUID authorId', async () => {
      const response = await request(app)
        .get('/api/v1/knowledge-base/content')
        .query({ authorId: 'not-a-uuid' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid authorId format');
    });

    it('should return 400 for an invalid date format in startDate', async () => {
      const response = await request(app)
        .get('/api/v1/knowledge-base/content')
        .query({ startDate: '2023/01/01' }); // Invalid format

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid date format for startDate');
    });

    it('should return 400 for a non-integer page parameter', async () => {
      const response = await request(app)
        .get('/api/v1/knowledge-base/content')
        .query({ page: 'one' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid page number');
    });

    it('should return 400 for a limit greater than 100', async () => {
      const response = await request(app)
        .get('/api/v1/knowledge-base/content')
        .query({ limit: 101 });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Limit cannot exceed 100');
    });

    it('should handle database query errors gracefully', async () => {
      db.query.mockRejectedValue(new Error('DB connection failed'));

      const response = await request(app).get('/api/v1/knowledge-base/content');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Internal Server Error');
    });
  });
});