const request = require('supertest');
const express = require('express');
const adminRouter = require('../../../src/routes/admin'); // Assuming the router is here
const db = require('../../../src/database'); // Assuming a database module

// Mock the database module
jest.mock('../../../src/database');

// Mock any authentication or authorization middleware
jest.mock('../../../src/middleware/auth', () => ({
  isAdmin: (req, res, next) => next(), // Bypass auth for testing
}));

const app = express();
app.use(express.json());
app.use('/api/v1/admin', adminRouter);

describe('POST /api/v1/admin/:itemType/reorder', () => {
  let mockConnection;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup mock transaction functions
    mockConnection = {
      beginTransaction: jest.fn(callback => callback(null)),
      query: jest.fn(),
      commit: jest.fn(callback => callback(null)),
      rollback: jest.fn(callback => callback(null)),
      release: jest.fn(),
    };

    // Mock the pool to return our mock connection
    db.pool = {
      getConnection: jest.fn(callback => callback(null, mockConnection)),
    };
  });

  const testCases = [
    {
      itemType: 'interaction-types',
      tableName: 'interaction_types',
      existingItems: [{ id: 1 }, { id: 2 }, { id: 3 }],
    },
    {
      itemType: 'custom-fields',
      tableName: 'custom_fields',
      existingItems: [{ id: 'cf_1' }, { id: 'cf_2' }],
    },
  ];

  testCases.forEach(({ itemType, tableName, existingItems }) => {
    it(`should successfully reorder ${itemType} and return 200`, async () => {
      const orderedIds = existingItems.map(item => item.id).reverse(); // e.g., [3, 2, 1]

      // Mock the initial check to confirm all IDs exist
      mockConnection.query.mockImplementation((sql, values, callback) => {
        if (sql.includes('SELECT id FROM')) {
          callback(null, existingItems);
        } else {
          callback(null, { affectedRows: 1 });
        }
      });

      const response = await request(app)
        .post(`/api/v1/admin/${itemType}/reorder`)
        .send({ orderedIds });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Order updated successfully.' });

      expect(db.pool.getConnection).toHaveBeenCalledTimes(1);
      expect(mockConnection.beginTransaction).toHaveBeenCalledTimes(1);

      // Verify that UPDATE was called for each item with the correct order
      orderedIds.forEach((id, index) => {
        expect(mockConnection.query).toHaveBeenCalledWith(
          expect.stringContaining(`UPDATE ${tableName} SET display_order = ? WHERE id = ?`),
          [index, id],
          expect.any(Function)
        );
      });

      expect(mockConnection.commit).toHaveBeenCalledTimes(1);
      expect(mockConnection.rollback).not.toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalledTimes(1);
    });
  });

  it('should return 400 for an invalid itemType', async () => {
    const response = await request(app)
      .post('/api/v1/admin/invalid-items/reorder')
      .send({ orderedIds: [1, 2, 3] });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Bad Request - Invalid item type or mismatched IDs.' });
    expect(db.pool.getConnection).not.toHaveBeenCalled();
  });

  it('should return 400 if orderedIds is not an array', async () => {
    const response = await request(app)
      .post('/api/v1/admin/interaction-types/reorder')
      .send({ orderedIds: 'not-an-array' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Bad Request - Invalid item type or mismatched IDs.' });
  });

  it('should return 400 if orderedIds array is empty', async () => {
    const response = await request(app)
      .post('/api/v1/admin/interaction-types/reorder')
      .send({ orderedIds: [] });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Bad Request - Invalid item type or mismatched IDs.' });
  });

  it('should return 400 if the number of IDs does not match existing items', async () => {
    // DB has 3 items, but request only sends 2
    mockConnection.query.mockImplementation((sql, values, callback) => {
      callback(null, [{ id: 1 }, { id: 2 }, { id: 3 }]);
    });

    const response = await request(app)
      .post('/api/v1/admin/interaction-types/reorder')
      .send({ orderedIds: [2, 1] });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Bad Request - Invalid item type or mismatched IDs.' });
    expect(mockConnection.beginTransaction).not.toHaveBeenCalled();
  });

  it('should return 400 if an unknown ID is provided', async () => {
    // DB has items 1 and 2, but request sends 1, 2, and 99
    mockConnection.query.mockImplementation((sql, values, callback) => {
      callback(null, [{ id: 1 }, { id: 2 }]);
    });

    const response = await request(app)
      .post('/api/v1/admin/interaction-types/reorder')
      .send({ orderedIds: [1, 2, 99] });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Bad Request - Invalid item type or mismatched IDs.' });
    expect(mockConnection.beginTransaction).not.toHaveBeenCalled();
  });

  it('should return 500 and rollback transaction if a database update fails', async () => {
    const orderedIds = [3, 2, 1];
    const dbError = new Error('DB update failed');

    // Mock the initial check to succeed
    mockConnection.query.mockImplementationOnce((sql, values, callback) => {
      callback(null, [{ id: 1 }, { id: 2 }, { id: 3 }]);
    });

    // Mock the first UPDATE to succeed, but the second to fail
    mockConnection.query.mockImplementationOnce((sql, values, callback) => {
      callback(null, { affectedRows: 1 });
    });
    mockConnection.query.mockImplementationOnce((sql, values, callback) => {
      callback(dbError);
    });

    const response = await request(app)
      .post('/api/v1/admin/interaction-types/reorder')
      .send({ orderedIds });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Internal Server Error' });

    expect(mockConnection.beginTransaction).toHaveBeenCalledTimes(1);
    expect(mockConnection.commit).not.toHaveBeenCalled();
    expect(mockConnection.rollback).toHaveBeenCalledTimes(1);
    expect(mockConnection.release).toHaveBeenCalledTimes(1);
  });
});