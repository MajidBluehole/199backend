const request = require('supertest');
const app = require('../../../src/app'); // Assuming your Express app is exported from here
const db = require('../../../src/db'); // Assuming a db module for database interactions

// Mock the database module
jest.mock('../../../src/db');

// Mock any authentication middleware if required. This example assumes a middleware that attaches a user to the request.
jest.mock('../../../src/middleware/auth', () => jest.fn((req, res, next) => {
  req.user = { id: 1, organization_id: 1 }; // Mock user object
  next();
}));

describe('POST /api/v1/feedback/tags', () => {
  beforeEach(() => {
    // Reset mocks before each test
    db.query.mockClear();
  });

  describe('Successful Requests', () => {
    it('should add new tags to feedback items and return 201', async () => {
      const requestBody = {
        feedbackIds: [1, 2],
        tagIds: [101, 102]
      };

      // Mock the check for existing tags to return an empty array (no conflicts)
      db.query.mockResolvedValueOnce([[]]);

      // Mock the bulk insert operation
      db.query.mockResolvedValueOnce([{
        affectedRows: 4, // 2 feedback items * 2 tags
        insertId: 1 // or some other relevant info
      }]);

      const response = await request(app)
        .post('/api/v1/feedback/tags')
        .send(requestBody);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: 'Tags added to feedback successfully.'
      });

      // Verify the check for existing tags was called correctly
      expect(db.query.mock.calls[0][0]).toContain('SELECT feedback_id, tag_id FROM feedback_to_tags WHERE');

      // Verify the bulk insert was called correctly
      const expectedValues = [[1, 101], [1, 102], [2, 101], [2, 102]];
      expect(db.query.mock.calls[1][0]).toBe('INSERT INTO feedback_to_tags (feedback_id, tag_id) VALUES ?');
      expect(db.query.mock.calls[1][1]).toEqual([expectedValues]);
    });
  });

  describe('Error Handling', () => {
    it('should return 400 if feedbackIds is missing', async () => {
      const response = await request(app)
        .post('/api/v1/feedback/tags')
        .send({ tagIds: [101] });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Bad Request - Invalid or missing 'feedbackIds' or 'tagIds'.");
      expect(db.query).not.toHaveBeenCalled();
    });

    it('should return 400 if tagIds is missing', async () => {
      const response = await request(app)
        .post('/api/v1/feedback/tags')
        .send({ feedbackIds: [1] });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Bad Request - Invalid or missing 'feedbackIds' or 'tagIds'.");
      expect(db.query).not.toHaveBeenCalled();
    });

    it('should return 400 if feedbackIds is not an array', async () => {
      const response = await request(app)
        .post('/api/v1/feedback/tags')
        .send({ feedbackIds: '1,2', tagIds: [101] });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Bad Request - Invalid or missing 'feedbackIds' or 'tagIds'.");
    });

    it('should return 400 if tagIds is not an array', async () => {
      const response = await request(app)
        .post('/api/v1/feedback/tags')
        .send({ feedbackIds: [1, 2], tagIds: '101' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Bad Request - Invalid or missing 'feedbackIds' or 'tagIds'.");
    });

    it('should return 400 if feedbackIds is an empty array', async () => {
        const response = await request(app)
          .post('/api/v1/feedback/tags')
          .send({ feedbackIds: [], tagIds: [101] });
  
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Bad Request - Invalid or missing 'feedbackIds' or 'tagIds'.");
      });

    it('should return 409 if one or more tag associations already exist', async () => {
      const requestBody = {
        feedbackIds: [1, 2],
        tagIds: [101, 102]
      };

      // Mock the check for existing tags to return a conflict
      const existingAssociation = [{ feedback_id: 1, tag_id: 101 }];
      db.query.mockResolvedValueOnce([existingAssociation]);

      const response = await request(app)
        .post('/api/v1/feedback/tags')
        .send(requestBody);

      expect(response.status).toBe(409);
      expect(response.body.message).toBe('Conflict - One or more tag associations already exist.');

      // Ensure only the SELECT query was called, not the INSERT
      expect(db.query).toHaveBeenCalledTimes(1);
      expect(db.query.mock.calls[0][0]).toContain('SELECT feedback_id, tag_id FROM feedback_to_tags WHERE');
    });

    it('should return 500 if the database query fails', async () => {
        const requestBody = {
          feedbackIds: [1, 2],
          tagIds: [101, 102]
        };
  
        // Mock a database error
        const errorMessage = 'Database connection error';
        db.query.mockRejectedValue(new Error(errorMessage));
  
        const response = await request(app)
          .post('/api/v1/feedback/tags')
          .send(requestBody);
  
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Internal Server Error');
      });
  });
});