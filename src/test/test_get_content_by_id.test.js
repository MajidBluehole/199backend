const request = require('supertest');
const app = require('../../../app'); // Assuming your Express app is exported from here
const db = require('../../../config/db'); // Assuming your DB connection/query module is here
const { authenticate } = require('../../../middleware/auth'); // Assuming auth middleware

// Mock the database module
jest.mock('../../../config/db');

// Mock the authentication middleware
jest.mock('../../../middleware/auth', () => ({
  authenticate: jest.fn((req, res, next) => {
    // Mock a successful authentication by default
    req.user = { id: 'user-uuid-123', organizationId: 'org-uuid-456' };
    next();
  }),
}));

describe('GET /api/v1/knowledge-base/content/:contentId', () => {
  const contentId = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
  const nonExistentContentId = '00000000-0000-0000-0000-000000000000';

  const mockContentData = {
    content_id: contentId,
    title: 'Test Content Title',
    description: 'A detailed description of the test content.',
    content_type: 'PDF',
    file_name: 'test_document.pdf',
    file_size: 102400,
    view_count: 10,
    download_count: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'user-uuid-123',
    uploader_name: 'John Doe',
    tags: 'tag1,tag2,tag3',
  };

  beforeEach(() => {
    // Clear all mock implementations and calls before each test
    jest.clearAllMocks();
    // Reset the default mock for authentication to success for each test
    authenticate.mockImplementation((req, res, next) => {
        req.user = { id: 'user-uuid-123', organizationId: 'org-uuid-456' };
        next();
    });
  });

  describe('Successful Retrieval', () => {
    it('should return 200 with content details and increment view count', async () => {
      // Mock the DB query for fetching content
      db.query.mockResolvedValueOnce([[
        {
          ...mockContentData,
        },
      ]]);
      // Mock the DB query for updating view count
      db.query.mockResolvedValueOnce([{
        affectedRows: 1
      }]);

      const response = await request(app)
        .get(`/api/v1/knowledge-base/content/${contentId}`)
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        content_id: mockContentData.content_id,
        title: mockContentData.title,
        description: mockContentData.description,
        content_type: mockContentData.content_type,
        file_name: mockContentData.file_name,
        file_size: mockContentData.file_size,
        view_count: mockContentData.view_count + 1, // Expect view count to be incremented
        download_count: mockContentData.download_count,
        created_at: mockContentData.created_at,
        updated_at: mockContentData.updated_at,
        uploader: {
          user_id: mockContentData.user_id,
          name: mockContentData.uploader_name,
        },
        tags: ['tag1', 'tag2', 'tag3'],
      });

      // Verify that the database was queried correctly
      expect(db.query).toHaveBeenCalledTimes(2);

      // Check the SELECT query
      expect(db.query.mock.calls[0][0]).toContain('SELECT');
      expect(db.query.mock.calls[0][0]).toContain('`content` c');
      expect(db.query.mock.calls[0][0]).toContain('LEFT JOIN `users` u ON c.uploaded_by = u.id');
      expect(db.query.mock.calls[0][0]).toContain('GROUP_CONCAT(t.name)');
      expect(db.query.mock.calls[0][1]).toContain(contentId);

      // Check the UPDATE query
      expect(db.query.mock.calls[1][0]).toContain('UPDATE `content`');
      expect(db.query.mock.calls[1][0]).toContain('SET `view_count` = `view_count` + 1');
      expect(db.query.mock.calls[1][1]).toContain(contentId);
    });

    it('should return content with an empty tags array if no tags are associated', async () => {
        const contentWithoutTags = { ...mockContentData, tags: null };
        db.query.mockResolvedValueOnce([[contentWithoutTags]]);
        db.query.mockResolvedValueOnce([{
            affectedRows: 1
        }]);

        const response = await request(app)
            .get(`/api/v1/knowledge-base/content/${contentId}`)
            .set('Authorization', 'Bearer valid-token');

        expect(response.status).toBe(200);
        expect(response.body.tags).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 if the content ID does not exist', async () => {
      // Mock the DB to return no results
      db.query.mockResolvedValueOnce([[]]);

      const response = await request(app)
        .get(`/api/v1/knowledge-base/content/${nonExistentContentId}`)
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: 'Not Found - Content with the specified ID does not exist.',
      });

      // Ensure the view count was not incremented
      expect(db.query).toHaveBeenCalledTimes(1);
    });

    it('should return 401 if the user is not authenticated', async () => {
      // Mock the authentication middleware to fail
      authenticate.mockImplementation((req, res, next) => {
        return res.status(401).json({ message: 'Unauthorized.' });
      });

      const response = await request(app).get(`/api/v1/knowledge-base/content/${contentId}`);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'Unauthorized.' });

      // Ensure no database calls were made
      expect(db.query).not.toHaveBeenCalled();
    });

    it('should return 500 if there is a database error during fetch', async () => {
        db.query.mockRejectedValueOnce(new Error('DB connection failed'));

        const response = await request(app)
            .get(`/api/v1/knowledge-base/content/${contentId}`)
            .set('Authorization', 'Bearer valid-token');

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('message', 'Internal Server Error');
    });

    it('should return 500 if there is a database error during view count update', async () => {
        db.query.mockResolvedValueOnce([[
            {
              ...mockContentData,
            },
          ]]);
        db.query.mockRejectedValueOnce(new Error('DB update failed'));

        const response = await request(app)
            .get(`/api/v1/knowledge-base/content/${contentId}`)
            .set('Authorization', 'Bearer valid-token');

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('message', 'Internal Server Error');
    });
  });
});