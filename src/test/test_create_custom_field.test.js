const request = require('supertest');
const express = require('express');
const customFieldsRouter = require('../../../../src/api/v1/routes/admin/customFieldsRouter'); // Adjust path as needed
const dbPool = require('../../../../src/db/mysql'); // Adjust path as needed

// Mock the database module
jest.mock('../../../../src/db/mysql');

// Mock any authentication or authorization middleware
jest.mock('../../../../src/middleware/auth', () => ({
  requireAdminAuth: (req, res, next) => next(), // Bypass auth for tests
}));

// Setup Express app for testing
const app = express();
app.use(express.json());
app.use('/api/v1/admin/custom-fields', customFieldsRouter);

// A generic error handler to catch unhandled errors in the middleware chain
app.use((err, req, res, next) => {
  console.error('Unhandled test error:', err);
  res.status(500).json({ message: err.message || 'An unexpected error occurred' });
});

describe('POST /api/v1/admin/custom-fields', () => {
  let mockConnection;

  beforeEach(() => {
    // Setup a fresh mock for each test
    mockConnection = {
      beginTransaction: jest.fn().mockResolvedValue(),
      query: jest.fn(),
      commit: jest.fn().mockResolvedValue(),
      rollback: jest.fn().mockResolvedValue(),
      release: jest.fn(),
    };
    dbPool.promise.mockReturnValue({ // Mock the pool object
        getConnection: jest.fn().mockResolvedValue(mockConnection),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful Creation', () => {
    it('should create a new TEXT custom field and return 201', async () => {
      const newFieldData = {
        name: 'Lead Source',
        entity_type: 'CONTACT',
        field_type: 'TEXT',
      };

      // Mock DB calls: 1. Check for existing name (none found), 2. Insert new field
      mockConnection.query
        .mockResolvedValueOnce([[]]) // No existing field found
        .mockResolvedValueOnce([{ insertId: 101 }]); // Successful insert

      const response = await request(app)
        .post('/api/v1/admin/custom-fields')
        .send(newFieldData);

      expect(response.status).toBe(201);
      expect(response.header['content-type']).toMatch(/json/);
      expect(response.body).toEqual({
        message: 'Custom field created successfully.',
        id: 101,
      });

      expect(mockConnection.beginTransaction).toHaveBeenCalledTimes(1);
      expect(mockConnection.query).toHaveBeenCalledTimes(2);
      expect(mockConnection.query).toHaveBeenCalledWith('SELECT 1 FROM custom_fields WHERE name = ? AND organization_id = ?', [newFieldData.name, expect.any(Number)]);
      expect(mockConnection.query).toHaveBeenCalledWith('INSERT INTO custom_fields SET ?', expect.objectContaining(newFieldData));
      expect(mockConnection.commit).toHaveBeenCalledTimes(1);
      expect(mockConnection.rollback).not.toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalledTimes(1);
    });

    it('should create a new DROPDOWN custom field with options and return 201', async () => {
      const newFieldData = {
        name: 'Customer Tier',
        entity_type: 'ORGANIZATION',
        field_type: 'DROPDOWN',
        options: ['Basic', 'Premium', 'Enterprise'],
      };
      const newFieldId = 102;

      // Mock DB calls: 1. Check name, 2. Insert field, 3. Insert options
      mockConnection.query
        .mockResolvedValueOnce([[]]) // No existing field
        .mockResolvedValueOnce([{ insertId: newFieldId }]) // Insert field returns ID
        .mockResolvedValueOnce([{}]); // Insert options is successful

      const response = await request(app)
        .post('/api/v1/admin/custom-fields')
        .send(newFieldData);

      expect(response.status).toBe(201);
      expect(response.body.id).toBe(newFieldId);

      expect(mockConnection.beginTransaction).toHaveBeenCalledTimes(1);
      expect(mockConnection.query).toHaveBeenCalledTimes(3);
      
      const expectedOptionsValues = newFieldData.options.map(opt => [newFieldId, opt]);
      expect(mockConnection.query).toHaveBeenCalledWith(
        'INSERT INTO custom_field_options (custom_field_id, value) VALUES ?',
        [expectedOptionsValues]
      );

      expect(mockConnection.commit).toHaveBeenCalledTimes(1);
      expect(mockConnection.rollback).not.toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('should return 409 Conflict if a custom field with the same name already exists', async () => {
      const conflictingFieldData = {
        name: 'Existing Field',
        entity_type: 'CONTACT',
        field_type: 'TEXT',
      };

      // Mock DB to find an existing field
      mockConnection.query.mockResolvedValueOnce([[{ '1': 1 }]]);

      const response = await request(app)
        .post('/api/v1/admin/custom-fields')
        .send(conflictingFieldData);

      expect(response.status).toBe(409);
      expect(response.body).toEqual({ message: 'Conflict - A custom field with this name already exists.' });

      // Transaction should not even start
      expect(mockConnection.beginTransaction).not.toHaveBeenCalled();
      expect(mockConnection.commit).not.toHaveBeenCalled();
      expect(mockConnection.rollback).not.toHaveBeenCalled();
      // Connection is still acquired and released
      expect(dbPool.promise().getConnection).toHaveBeenCalledTimes(1);
      expect(mockConnection.release).toHaveBeenCalledTimes(1);
    });

    it('should return 400 Bad Request for invalid input data (e.g., missing name)', async () => {
      const invalidData = {
        entity_type: 'CONTACT',
        field_type: 'TEXT',
      };

      const response = await request(app)
        .post('/api/v1/admin/custom-fields')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('"name" is required'); // Assuming Joi or similar validation

      // No DB calls should be made for validation errors
      expect(dbPool.promise().getConnection).not.toHaveBeenCalled();
    });

    it('should return 500 and rollback the transaction if creating options fails', async () => {
        const newFieldData = {
            name: 'Failing Field',
            entity_type: 'CONTACT',
            field_type: 'MULTI_SELECT',
            options: ['A', 'B'],
        };
        const dbError = new Error('DB insert failed');

        // Mock DB calls: 1. Check name (ok), 2. Insert field (ok), 3. Insert options (fails)
        mockConnection.query
            .mockResolvedValueOnce([[]])
            .mockResolvedValueOnce([{ insertId: 103 }])
            .mockRejectedValueOnce(dbError);

        const response = await request(app)
            .post('/api/v1/admin/custom-fields')
            .send(newFieldData);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('An unexpected error occurred');

        expect(mockConnection.beginTransaction).toHaveBeenCalledTimes(1);
        expect(mockConnection.query).toHaveBeenCalledTimes(3);
        expect(mockConnection.commit).not.toHaveBeenCalled();
        expect(mockConnection.rollback).toHaveBeenCalledTimes(1);
        expect(mockConnection.release).toHaveBeenCalledTimes(1);
    });
  });
});