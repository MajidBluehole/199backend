const request = require('supertest');
const express = require('express');
const { v4: uuidv4 } = require('uuid');

// Mock the data access layer
const customFieldService = require('../../../services/customFieldService');
// Mock the authentication middleware
const { isAdmin } = require('../../../middleware/auth');

// Mock the actual router
const customFieldsRouter = require('../../../routes/api/v1/admin/custom-fields');

// Mock implementations
jest.mock('../../../services/customFieldService');
jest.mock('../../../middleware/auth', () => ({
  isAdmin: jest.fn(),
}));

// Setup express app for testing
const app = express();
app.use(express.json());
app.use('/api/v1/admin/custom-fields', customFieldsRouter);

// Centralized error handler for simulating real app behavior
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'An internal server error occurred.' });
});

describe('GET /api/v1/admin/custom-fields', () => {

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('Successful Retrieval', () => {
    it('should return 200 OK with a list of custom fields and their options', async () => {
      // --- Setup ---
      const mockFieldId1 = uuidv4();
      const mockFieldId2 = uuidv4();
      const mockFieldId3 = uuidv4();

      const mockCustomFields = [
        {
          id: mockFieldId1,
          name: 'lead_source',
          label: 'Lead Source',
          field_type: 'DROPDOWN',
          display_order: 1,
          options: [
            { id: uuidv4(), value: 'Website', display_order: 1 },
            { id: uuidv4(), value: 'Referral', display_order: 2 },
          ],
        },
        {
          id: mockFieldId2,
          name: 'deal_size',
          label: 'Deal Size',
          field_type: 'NUMBER',
          display_order: 2,
          options: [],
        },
        {
          id: mockFieldId3,
          name: 'product_interests',
          label: 'Product Interests',
          field_type: 'MULTI_SELECT',
          display_order: 3,
          options: [
            { id: uuidv4(), value: 'Product A', display_order: 1 },
            { id: uuidv4(), value: 'Product B', display_order: 2 },
            { id: uuidv4(), value: 'Product C', display_order: 3 },
          ],
        },
      ];

      // Mock successful authentication
      isAdmin.mockImplementation((req, res, next) => next());

      // Mock the service layer to return our data
      customFieldService.getAllWithOptions.mockResolvedValue(mockCustomFields);

      // --- Action ---
      const response = await request(app).get('/api/v1/admin/custom-fields');

      // --- Assertions ---
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/json/);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(3);

      // Verify the structure of the first item (DROPDOWN)
      const dropdownField = response.body.find(f => f.field_type === 'DROPDOWN');
      expect(dropdownField).toBeDefined();
      expect(dropdownField.id).toBe(mockFieldId1);
      expect(dropdownField.name).toBe('lead_source');
      expect(dropdownField.field_type).toBe('DROPDOWN');
      expect(Array.isArray(dropdownField.options)).toBe(true);
      expect(dropdownField.options.length).toBe(2);
      expect(dropdownField.options[0].value).toBe('Website');

      // Verify the structure of the second item (NUMBER)
      const numberField = response.body.find(f => f.field_type === 'NUMBER');
      expect(numberField).toBeDefined();
      expect(numberField.id).toBe(mockFieldId2);
      expect(numberField.name).toBe('deal_size');
      expect(Array.isArray(numberField.options)).toBe(true);
      expect(numberField.options.length).toBe(0);

      // Verify the service was called
      expect(customFieldService.getAllWithOptions).toHaveBeenCalledTimes(1);
      expect(isAdmin).toHaveBeenCalledTimes(1);
    });

    it('should return 200 OK with an empty array if no custom fields exist', async () => {
        // --- Setup ---
        isAdmin.mockImplementation((req, res, next) => next());
        customFieldService.getAllWithOptions.mockResolvedValue([]);

        // --- Action ---
        const response = await request(app).get('/api/v1/admin/custom-fields');

        // --- Assertions ---
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
        expect(customFieldService.getAllWithOptions).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('should return 401 Unauthorized if the user is not authenticated as an admin', async () => {
      // --- Setup ---
      // Mock middleware to reject the request
      isAdmin.mockImplementation((req, res, next) => {
        // In a real app, this might be handled by a centralized error handler
        // but for a direct test, we can send the response here.
        res.status(401).json({ message: 'Unauthorized.' });
      });

      // --- Action ---
      const response = await request(app).get('/api/v1/admin/custom-fields');

      // --- Assertions ---
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'Unauthorized.' });
      // Ensure the service layer was not called
      expect(customFieldService.getAllWithOptions).not.toHaveBeenCalled();
    });

    it('should return 500 Internal Server Error if the service layer throws an error', async () => {
      // --- Setup ---
      isAdmin.mockImplementation((req, res, next) => next());
      const dbError = new Error('Database connection failed');
      customFieldService.getAllWithOptions.mockRejectedValue(dbError);

      // --- Action ---
      const response = await request(app).get('/api/v1/admin/custom-fields');

      // --- Assertions ---
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: 'An internal server error occurred.' });
      expect(customFieldService.getAllWithOptions).toHaveBeenCalledTimes(1);
    });
  });
});