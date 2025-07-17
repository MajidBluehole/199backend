const request = require('supertest');
const app = require('../../../app'); // Assuming your Express app is exported from here
const db = require('../../../config/db'); // Assuming your db connection pool is exported from here
const { v4: uuidv4 } = require('uuid');

// Mock the database module
jest.mock('../../../config/db');

describe('DELETE /api/v1/admin/interaction-types/:id', () => {
    let deletableTypeId;
    let systemTypeId;
    let inUseTypeId;
    let nonExistentTypeId;

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();

        // Generate fresh UUIDs for each test run
        deletableTypeId = uuidv4();
        systemTypeId = uuidv4();
        inUseTypeId = uuidv4();
        nonExistentTypeId = uuidv4();
    });

    test('should delete an interaction type successfully and return 204 No Content', async () => {
        // Mock DB: Find a deletable type
        db.pool.query
            .mockResolvedValueOnce([[{ id: deletableTypeId, name: 'Custom Call', is_deletable: 1 }], []]);
        
        // Mock DB: Check for usage, finds none
        db.pool.query
            .mockResolvedValueOnce([[{ count: 0 }], []]);

        // Mock DB: Successful deletion
        db.pool.query
            .mockResolvedValueOnce([{ affectedRows: 1 }, []]);

        const response = await request(app)
            .delete(`/api/v1/admin/interaction-types/${deletableTypeId}`)
            .set('Authorization', 'Bearer valid-admin-token'); // Assuming JWT auth for admin routes

        expect(response.status).toBe(204);
        expect(response.body).toEqual({});

        // Verify the correct sequence of DB calls
        expect(db.pool.query).toHaveBeenCalledTimes(3);
        expect(db.pool.query).toHaveBeenCalledWith(expect.stringMatching(/^SELECT \* FROM interaction_types/), [deletableTypeId]);
        expect(db.pool.query).toHaveBeenCalledWith(expect.stringMatching(/^SELECT COUNT\(\*\)/), [deletableTypeId]);
        expect(db.pool.query).toHaveBeenCalledWith(expect.stringMatching(/^DELETE FROM interaction_types/), [deletableTypeId]);
    });

    test('should return 404 Not Found if the interaction type ID does not exist', async () => {
        // Mock DB: Find query returns no results
        db.pool.query.mockResolvedValueOnce([[], []]);

        const response = await request(app)
            .delete(`/api/v1/admin/interaction-types/${nonExistentTypeId}`)
            .set('Authorization', 'Bearer valid-admin-token');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            message: 'Not Found - Interaction type with the specified ID does not exist.'
        });
        expect(db.pool.query).toHaveBeenCalledTimes(1);
    });

    test('should return 403 Forbidden if the interaction type is a system default', async () => {
        // Mock DB: Find query returns a non-deletable (system) type
        db.pool.query
            .mockResolvedValueOnce([[{ id: systemTypeId, name: 'Email', is_deletable: 0 }], []]);

        const response = await request(app)
            .delete(`/api/v1/admin/interaction-types/${systemTypeId}`)
            .set('Authorization', 'Bearer valid-admin-token');

        expect(response.status).toBe(403);
        expect(response.body).toEqual({
            message: 'Forbidden - This interaction type is a system default and cannot be deleted.'
        });
        expect(db.pool.query).toHaveBeenCalledTimes(1);
    });

    test('should return 409 Conflict if the interaction type is in use', async () => {
        // Mock DB: Find query returns a deletable type
        db.pool.query
            .mockResolvedValueOnce([[{ id: inUseTypeId, name: 'Meeting', is_deletable: 1 }], []]);
        
        // Mock DB: Check for usage finds associated interactions
        db.pool.query
            .mockResolvedValueOnce([[{ count: 3 }], []]);

        const response = await request(app)
            .delete(`/api/v1/admin/interaction-types/${inUseTypeId}`)
            .set('Authorization', 'Bearer valid-admin-token');

        expect(response.status).toBe(409);
        expect(response.body).toEqual({
            message: 'Conflict - This interaction type is in use and cannot be deleted without migrating associated data.'
        });
        expect(db.pool.query).toHaveBeenCalledTimes(2);
    });

    test('should return 500 if there is a database error during the process', async () => {
        const dbError = new Error('Database connection failed');
        
        // Mock DB: Find query throws an error
        db.pool.query.mockRejectedValueOnce(dbError);

        const response = await request(app)
            .delete(`/api/v1/admin/interaction-types/${deletableTypeId}`)
            .set('Authorization', 'Bearer valid-admin-token');

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('message', 'An internal server error occurred.');
    });
});