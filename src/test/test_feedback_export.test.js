const request = require('supertest');
const express = require('express');
const feedbackRouter = require('../../../routes/v1/feedback'); // Assuming the router is here
const feedbackService = require('../../../services/feedbackService'); // The service to be mocked

// Mock the service layer
jest.mock('../../../services/feedbackService');

// Mock authentication middleware
const mockAuth = (req, res, next) => {
  req.user = { id: 1, organizationId: 1 };
  next();
};

const app = express();
app.use(express.json());
app.use('/api/v1/feedback', mockAuth, feedbackRouter);


describe('GET /api/v1/feedback/export', () => {

  const mockFeedbackData = [
    {
      id: 101,
      comment: 'Excellent service, very helpful!',
      rating: 5,
      tags: ['positive', 'support'],
      user_name: 'Alice',
      created_at: '2023-10-27T10:00:00Z'
    },
    {
      id: 102,
      comment: 'The new feature is a bit confusing.',
      rating: 3,
      tags: ['ui', 'feature-request'],
      user_name: 'Bob',
      created_at: '2023-10-27T11:30:00Z'
    }
  ];

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('Successful Exports', () => {
    it('should export feedback as a CSV file', async () => {
      feedbackService.getFilteredFeedback.mockResolvedValue(mockFeedbackData);

      const response = await request(app)
        .get('/api/v1/feedback/export?format=csv');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('application/csv');
      expect(response.headers['content-disposition']).toMatch(/attachment; filename="feedback_export_.*\.csv"/);
      
      // Check if the CSV content is correct
      const expectedCsvHeader = '"id","comment","rating","tags","user_name","created_at"';
      const expectedCsvRow1 = '101,"Excellent service, very helpful!",5,"positive,support","Alice","2023-10-27T10:00:00Z"';
      expect(response.text).toContain(expectedCsvHeader);
      expect(response.text).toContain(expectedCsvRow1);
      expect(feedbackService.getFilteredFeedback).toHaveBeenCalledWith({ organizationId: 1 }, {});
    });

    it('should export feedback as a PDF file', async () => {
      feedbackService.getFilteredFeedback.mockResolvedValue(mockFeedbackData);

      const response = await request(app)
        .get('/api/v1/feedback/export?format=pdf');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('application/pdf');
      expect(response.headers['content-disposition']).toMatch(/attachment; filename="feedback_export_.*\.pdf"/);
      expect(response.body).toBeInstanceOf(Buffer);
      expect(response.body.length).toBeGreaterThan(0);
      expect(feedbackService.getFilteredFeedback).toHaveBeenCalledTimes(1);
    });

    it('should apply search filters when exporting to CSV', async () => {
      const filteredData = [mockFeedbackData[0]];
      feedbackService.getFilteredFeedback.mockResolvedValue(filteredData);

      const response = await request(app)
        .get('/api/v1/feedback/export?format=csv&search=excellent');

      expect(response.status).toBe(200);
      expect(feedbackService.getFilteredFeedback).toHaveBeenCalledWith({ organizationId: 1 }, { search: 'excellent' });
      
      const expectedCsvRow1 = '101,"Excellent service, very helpful!",5,"positive,support","Alice","2023-10-27T10:00:00Z"';
      const unexpectedCsvRow2 = '102,"The new feature is a bit confusing.",3,"ui,feature-request","Bob","2023-10-27T11:30:00Z"';
      expect(response.text).toContain(expectedCsvRow1);
      expect(response.text).not.toContain(unexpectedCsvRow2);
    });

    it('should return a CSV with only headers when no feedback data is found', async () => {
        feedbackService.getFilteredFeedback.mockResolvedValue([]);
  
        const response = await request(app)
          .get('/api/v1/feedback/export?format=csv');
  
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('application/csv');
        
        const expectedCsvHeader = '"id","comment","rating","tags","user_name","created_at"';
        // The response text might include a newline character
        expect(response.text.trim()).toBe(expectedCsvHeader);
      });
  });

  describe('Error Handling', () => {
    it('should return 400 if the format query parameter is missing', async () => {
      const response = await request(app)
        .get('/api/v1/feedback/export');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: 'Bad Request - Invalid format specified. Must be one of: csv, pdf.'
      });
    });

    it('should return 400 if an unsupported format is specified', async () => {
      const response = await request(app)
        .get('/api/v1/feedback/export?format=xml');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: 'Bad Request - Invalid format specified. Must be one of: csv, pdf.'
      });
    });

    it('should handle errors from the feedback service gracefully', async () => {
        const errorMessage = 'Database connection failed';
        feedbackService.getFilteredFeedback.mockRejectedValue(new Error(errorMessage));
  
        const response = await request(app)
          .get('/api/v1/feedback/export?format=csv');
  
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'An internal server error occurred.' });
      });
  });
});