const request = require('supertest');
const app = require('../../../app'); // Assuming your Express app is exported from here
const { v4: uuidv4 } = require('uuid');

// Mock dependencies
const authMiddleware = require('../../../middleware/auth');
const s3Service = require('../../../services/s3Service');
const db = require('../../../services/db'); // Assuming a database service/module

// Mock the entire modules
jest.mock('../../../middleware/auth');
jest.mock('../../../services/s3Service');
jest.mock('../../../services/db');

// Mock specific middleware implementations
const mockAuth = (req, res, next) => {
  req.user = { id: 'user-123', organization_id: 'org-abc', permissions: ['upload_content'] };
  next();
};

const mockAuthForbidden = (req, res, next) => {
  req.user = { id: 'user-456', organization_id: 'org-abc', permissions: ['read_only'] };
  next();
};

const mockAuthUnauthorized = (req, res, next) => {
    // In a real app, the middleware would likely be configured to throw an error or call next with an error
    // For testing, we can simulate this by having the router not even be hit if auth fails.
    // Here, we'll just mock the endpoint's check.
    res.status(401).json({ message: 'Unauthorized.' });
};

describe('POST /api/v1/knowledge-base/content', () => {
  let mockUser;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    mockUser = {
      id: 'user-123',
      organization_id: 'org-abc',
      permissions: ['upload_content']
    };

    // Default mock for successful authentication
    authMiddleware.isAuthorized = jest.fn((permissions) => (req, res, next) => {
        if (req.user && permissions.every(p => req.user.permissions.includes(p))) {
            return next();
        }
        return res.status(403).json({ message: 'Forbidden - User does not have permission to upload.' });
    });

    authMiddleware.authenticate = jest.fn((req, res, next) => {
        req.user = mockUser;
        next();
    });
  });

  describe('Success Scenarios', () => {
    it('should return 201 and content details on successful upload', async () => {
      const contentId = uuidv4();
      const fileContent = 'This is a test file.';
      const title = 'Test Document';
      const tags = ['testing', 'api'];

      // Mock S3 upload success
      s3Service.uploadStream.mockResolvedValue({
        Location: `https://s3.amazonaws.com/bucket/${contentId}.txt`,
        Key: `${contentId}.txt`
      });

      // Mock database transaction
      db.pool = {
        getConnection: jest.fn().mockReturnThis(),
        beginTransaction: jest.fn().mockReturnThis(),
        query: jest.fn((sql, params) => {
          if (sql.includes('INSERT INTO knowledge_content')) {
            return Promise.resolve([{ insertId: contentId }]);
          }
          if (sql.includes('SELECT id, name FROM tags')) {
            return Promise.resolve([[{ id: 'tag-1', name: 'testing' }]]);
          }
          if (sql.includes('INSERT INTO tags')) {
            return Promise.resolve([{ insertId: 'tag-2' }]);
          }
          if (sql.includes('INSERT INTO content_tags')) {
            return Promise.resolve([{}]);
          }
          return Promise.resolve([[]]);
        }),
        commit: jest.fn().mockResolvedValue(true),
        release: jest.fn()
      };

      const response = await request(app)
        .post('/api/v1/knowledge-base/content')
        .set('Authorization', 'Bearer valid-token')
        .field('title', title)
        .field('tags', JSON.stringify(tags))
        .attach('file', Buffer.from(fileContent), 'test.txt');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('content_id');
      expect(response.body.title).toBe(title);
      expect(response.body.upload_status).toBe('Completed');
      
      // Verify DB calls
      expect(db.pool.beginTransaction).toHaveBeenCalled();
      expect(db.pool.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO knowledge_content'), expect.any(Array));
      expect(db.pool.query).toHaveBeenCalledWith(expect.stringContaining('SELECT id, name FROM tags'), [tags]);
      expect(db.pool.commit).toHaveBeenCalled();
    });
  });

  describe('Error Scenarios', () => {
    it('should return 400 if title is missing', async () => {
      const response = await request(app)
        .post('/api/v1/knowledge-base/content')
        .set('Authorization', 'Bearer valid-token')
        .attach('file', Buffer.from('content'), 'test.txt');

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Missing required fields');
    });

    it('should return 400 if file is missing', async () => {
      const response = await request(app)
        .post('/api/v1/knowledge-base/content')
        .set('Authorization', 'Bearer valid-token')
        .field('title', 'My Title');

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Missing required fields');
    });

    it('should return 401 if user is not authenticated', async () => {
      // Mock the authentication middleware to fail
      authMiddleware.authenticate.mockImplementation((req, res, next) => {
        res.status(401).json({ message: 'Unauthorized.' });
      });

      const response = await request(app)
        .post('/api/v1/knowledge-base/content')
        .field('title', 'My Title')
        .attach('file', Buffer.from('content'), 'test.txt');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized.');
    });

    it('should return 403 if user does not have upload permissions', async () => {
      // Setup user with insufficient permissions
      mockUser.permissions = ['read_only'];

      const response = await request(app)
        .post('/api/v1/knowledge-base/content')
        .set('Authorization', 'Bearer valid-token-no-perms')
        .field('title', 'My Title')
        .attach('file', Buffer.from('content'), 'test.txt');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Forbidden - User does not have permission to upload.');
    });

    it('should return 413 if file exceeds size limit', async () => {
        // This test assumes a file size limit middleware (like multer) is configured
        // and that it has an error handler that returns 413.
        // We can't easily test the middleware itself, but we can test the route's response to a mocked error.
        
        // To simulate this, we'll mock the controller to throw a specific error that the global error handler catches.
        const { MulterError } = require('multer');
        s3Service.uploadStream.mockImplementation(() => {
            throw new MulterError('LIMIT_FILE_SIZE');
        });

        const response = await request(app)
            .post('/api/v1/knowledge-base/content')
            .set('Authorization', 'Bearer valid-token')
            .field('title', 'Large File Test')
            .attach('file', Buffer.from('large content'), 'large.txt');

        // The expected status depends on the global error handler implementation
        expect(response.status).toBe(413);
        expect(response.body.message).toBe('Payload Too Large - File exceeds maximum allowed size.');
    });

    it('should update status to Failed and rollback transaction on DB error', async () => {
        const dbError = new Error('DB connection failed');
        s3Service.uploadStream.mockResolvedValue({ Location: 'some-location' });

        // Mock a failing database transaction
        db.pool = {
            getConnection: jest.fn().mockReturnThis(),
            beginTransaction: jest.fn().mockReturnThis(),
            query: jest.fn()
                .mockImplementationOnce((sql) => { // First query (INSERT knowledge_content)
                    if (sql.includes('INSERT INTO knowledge_content')) {
                        return Promise.resolve([{ insertId: 'temp-id' }]);
                    }
                })
                .mockRejectedValueOnce(dbError), // Second query (e.g., tags) fails
            rollback: jest.fn().mockResolvedValue(true),
            release: jest.fn()
        };

        const response = await request(app)
            .post('/api/v1/knowledge-base/content')
            .set('Authorization', 'Bearer valid-token')
            .field('title', 'DB Fail Test')
            .attach('file', Buffer.from('content'), 'test.txt');

        expect(response.status).toBe(500); // Internal server error is appropriate here
        expect(db.pool.beginTransaction).toHaveBeenCalled();
        expect(db.pool.rollback).toHaveBeenCalled();
        expect(db.pool.release).toHaveBeenCalled();
    });
  });
});