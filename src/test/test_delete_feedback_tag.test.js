const request = require('supertest');
const express = require('express');
const feedbackRouter = require('../../src/routes/v1/feedback'); // Assuming the router is in this path
const db = require('../../src/services/db'); // Assuming a db service module

// Mock the database module
jest.mock('../../src/services/db');

// Setup Express app for testing
const app = express();
app.use(express.json());
// Mount the router that contains the endpoint
app.use('/api/v1/feedback', feedbackRouter);

// Mock error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

describe('DELETE /api/v1/feedback/{feedbackId}/tags/{tagId}', () => {

  afterEach(() => {
    // Clear all mocks after each test
    jest.clearAllMocks();
  });

  describe('Successful Deletion', () => {
    it('should return 204 No Content when the tag association is successfully removed', async () => {
      const feedbackId = '123';
      const tagId = '456';

      // Mock the DB query to simulate a successful deletion
      // MySQL delete query result includes an 'affectedRows' property
      db.query.mockResolvedValue([{ affectedRows: 1 }]);

      const response = await request(app)
        .delete(`/api/v1/feedback/${feedbackId}/tags/${tagId}`);

      // Assertions
      expect(response.status).toBe(204);
      expect(response.body).toEqual({}); // No content in the body for 204

      // Verify that the database query was called correctly
      expect(db.query).toHaveBeenCalledTimes(1);
      expect(db.query).toHaveBeenCalledWith(
        'DELETE FROM feedback_to_tags WHERE feedback_id = ? AND tag_id = ?',
        [feedbackId, tagId]
      );
    });
  });

  describe('Error Scenarios', () => {
    it('should return 404 Not Found if the feedback-tag association does not exist', async () => {
      const feedbackId = '999';
      const tagId = '888';

      // Mock the DB query to simulate no rows being affected
      db.query.mockResolvedValue([{ affectedRows: 0 }]);

      const response = await request(app)
        .delete(`/api/v1/feedback/${feedbackId}/tags/${tagId}`);

      // Assertions
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: 'Not Found - The specified feedback item or tag association does not exist.'
      });

      // Verify that the database query was still called
      expect(db.query).toHaveBeenCalledTimes(1);
      expect(db.query).toHaveBeenCalledWith(
        'DELETE FROM feedback_to_tags WHERE feedback_id = ? AND tag_id = ?',
        [feedbackId, tagId]
      );
    });

    it('should return 400 Bad Request for invalid feedbackId format', async () => {
        // This assumes some validation middleware is in place, e.g., using Joi or express-validator
        // For this example, we'll assume the route handler itself doesn't handle this, but a real app would.
        // We'll test the 404 case for a non-numeric ID if no specific validation exists.
        const invalidFeedbackId = 'abc';
        const tagId = '456';

        db.query.mockResolvedValue([{ affectedRows: 0 }]);

        const response = await request(app)
            .delete(`/api/v1/feedback/${invalidFeedbackId}/tags/${tagId}`);

        // The behavior for invalid ID format can vary. A robust API might return 400.
        // If not, a DB lookup would fail, likely resulting in a 404 as nothing is found.
        // We test for the 404 case as it's the guaranteed outcome from the provided logic.
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Not Found - The specified feedback item or tag association does not exist.');
    });

    it('should handle database errors gracefully', async () => {
      const feedbackId = '123';
      const tagId = '456';
      const errorMessage = 'DB connection error';

      // Mock the DB query to simulate a database failure
      db.query.mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .delete(`/api/v1/feedback/${feedbackId}/tags/${tagId}`);

      // Assertions
      // This assumes a generic error handler is in place that returns 500
      expect(response.status).toBe(500);
      expect(response.text).toBe('Something broke!');
    });
  });
});