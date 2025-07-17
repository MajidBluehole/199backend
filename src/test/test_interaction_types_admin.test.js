const request = require('supertest');
const express = require('express');
const { v4: uuidv4 } = require('uuid');

// Assuming your router is exported from this path
const adminRouter = require('../../../routes/v1/admin'); 
// Assuming your db connection pool is exported from here
const db = require('../../../db');

// Mock the database module
jest.mock('../../../db');

// Mock middleware
jest.mock('../../../middleware/auth', () => ({
  // Mocking isAdmin to automatically call next()
  // This bypasses authentication for testing purposes
  isAdmin: (req, res, next) => next(),
}));

const app = express();
app.use(express.json());
// Mount the router under the tested path
app.use('/api/v1/admin', adminRouter);

describe('POST /api/v1/admin/interaction-types', () => {

  beforeEach(() => {
    // Clear all mock implementations and calls before each test
    jest.clearAllMocks();
  });

  describe('Success Scenarios', () => {
    it('should create a new interaction type and return 201', async () => {
      const newTypeId = uuidv4();
      const requestBody = {
        name: 'Client Meeting',
        icon_name: 'meeting-icon',
      };

      const createdInteractionType = {
        id: newTypeId,
        ...requestBody,
        is_deletable: true,
        display_order: 6,
      };

      // Mocking the sequence of database calls
      db.query
        // 1. Check if name exists (returns empty, so it's available)
        .mockResolvedValueOnce([[]])
        // 2. Get the current max display_order
        .mockResolvedValueOnce([[{ max_order: 5 }]])
        // 3. The INSERT query result (not used in response, but call is made)
        .mockResolvedValueOnce([{ insertId: 1 }])
        // 4. Fetch the newly created record to return it
        .mockResolvedValueOnce([[createdInteractionType]]);

      const response = await request(app)
        .post('/api/v1/admin/interaction-types')
        .send(requestBody);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdInteractionType);
      expect(response.headers['content-type']).toMatch(/json/);

      // Verify DB calls
      expect(db.query).toHaveBeenCalledTimes(4);
      // 1. Check for existing name
      expect(db.query).toHaveBeenCalledWith(
        'SELECT id FROM interaction_types WHERE name = ?',
        [requestBody.name]
      );
      // 2. Get max display order
      expect(db.query).toHaveBeenCalledWith(
        'SELECT MAX(display_order) as max_order FROM interaction_types'
      );
      // 3. Insert new record
      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO interaction_types (id, name, icon_name, is_deletable, display_order) VALUES (?, ?, ?, ?, ?)',
        [expect.any(String), requestBody.name, requestBody.icon_name, true, 6]
      );
    });

     it('should correctly set display_order to 1 if no types exist', async () => {
      const newTypeId = uuidv4();
      const requestBody = {
        name: 'First Type',
        icon_name: 'first-icon',
      };

      const createdInteractionType = {
        id: newTypeId,
        ...requestBody,
        is_deletable: true,
        display_order: 1,
      };

      db.query
        .mockResolvedValueOnce([[]]) // Name check
        .mockResolvedValueOnce([[{ max_order: null }]]) // Max order is null
        .mockResolvedValueOnce([{ insertId: 1 }]) // Insert
        .mockResolvedValueOnce([[createdInteractionType]]); // Select new

      const response = await request(app)
        .post('/api/v1/admin/interaction-types')
        .send(requestBody);

      expect(response.status).toBe(201);
      expect(response.body.display_order).toBe(1);
    });
  });

  describe('Error Scenarios', () => {
    it('should return 409 Conflict if an interaction type with the same name already exists', async () => {
      const requestBody = {
        name: 'Existing Type',
        icon_name: 'some-icon',
      };

      // Mock DB to find an existing type with the same name
      db.query.mockResolvedValueOnce([[{ id: uuidv4(), name: 'Existing Type' }]]);

      const response = await request(app)
        .post('/api/v1/admin/interaction-types')
        .send(requestBody);

      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        message: 'Conflict - An interaction type with this name already exists.',
      });
      expect(db.query).toHaveBeenCalledTimes(1);
    });

    it('should return 400 Bad Request if the name field is missing', async () => {
      const requestBody = {
        icon_name: 'no-name-icon',
      };

      const response = await request(app)
        .post('/api/v1/admin/interaction-types')
        .send(requestBody);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: 'Bad Request - Missing required fields.',
      });
      // The database should not be called if validation fails
      expect(db.query).not.toHaveBeenCalled();
    });

    it('should return 400 Bad Request if the icon_name field is missing', async () => {
        const requestBody = {
          name: 'No Icon Name',
        };
  
        const response = await request(app)
          .post('/api/v1/admin/interaction-types')
          .send(requestBody);
  
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          message: 'Bad Request - Missing required fields.',
        });
        expect(db.query).not.toHaveBeenCalled();
      });

    it('should return 500 Internal Server Error if the database fails', async () => {
        const requestBody = {
            name: 'Client Meeting',
            icon_name: 'meeting-icon',
        };

        // Mock a database error
        db.query.mockRejectedValue(new Error('Database connection failed'));

        const response = await request(app)
            .post('/api/v1/admin/interaction-types')
            .send(requestBody);

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('message', 'Internal Server Error');
    });
  });
});