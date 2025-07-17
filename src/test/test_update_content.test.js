const request = require('supertest');
const app = require('../../../app'); // Assuming your Express app is exported from 'app.js' in the root
const db = require('../../../services/db'); // Assuming a centralized db service module
const jwt = require('jsonwebtoken');

// Mock the database module
jest.mock('../../../services/db');

// --- Test Setup ---
describe('PUT /api/v1/knowledge-base/content/:contentId', () => {
    let adminToken, ownerToken, otherUserToken;
    const contentId = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
    const ownerId = 'user-uuid-1111';
    const adminId = 'user-uuid-2222';
    const otherUserId = 'user-uuid-3333';

    beforeAll(() => {
        // Create JWTs for different user roles for testing authorization
        const jwtSecret = process.env.JWT_SECRET || 'test-secret';
        ownerToken = jwt.sign({ id: ownerId, role: 'user', organization_id: 'org-1' }, jwtSecret, { expiresIn: '1h' });
        adminToken = jwt.sign({ id: adminId, role: 'admin', organization_id: 'org-1' }, jwtSecret, { expiresIn: '1h' });
        otherUserToken = jwt.sign({ id: otherUserId, role: 'user', organization_id: 'org-1' }, jwtSecret, { expiresIn: '1h' });
    });

    beforeEach(() => {
        // Clear all mock implementations and calls before each test
        jest.clearAllMocks();
    });

    // --- Success Scenarios ---
    test('should update content and return 200 for an admin user', async () => {
        const updatePayload = {
            title: 'Updated Title by Admin',
            description: 'This is the new description.',
            tags: ['compliance', 'policy', 'updated']
        };

        // Mock 1: Fetch content for authorization check (returns content owned by someone else)
        db.query.mockResolvedValueOnce([[{ id: contentId, created_by: ownerId }]]);

        // Mock 2: Transaction for updating tags and content
        // This simulates the transaction: BEGIN, DELETE, INSERT, UPDATE, COMMIT
        db.query.mockResolvedValueOnce([{}]) // BEGIN
                .mockResolvedValueOnce([{}]) // DELETE from content_tags
                .mockResolvedValueOnce([[{ id: 'tag-uuid-1' }, { id: 'tag-uuid-2' }, { id: 'tag-uuid-3' }]]) // Find/Create tags
                .mockResolvedValueOnce([{}]) // INSERT into content_tags
                .mockResolvedValueOnce([{}]) // UPDATE content
                .mockResolvedValueOnce([{}]); // COMMIT

        const response = await request(app)
            .put(`/api/v1/knowledge-base/content/${contentId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(updatePayload);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('content_id', contentId);
        expect(response.body).toHaveProperty('title', updatePayload.title);
        expect(response.body).toHaveProperty('description', updatePayload.description);
        expect(response.body.tags).toEqual(expect.arrayContaining(updatePayload.tags));
        expect(response.body).toHaveProperty('updated_at');
        expect(new Date(response.body.updated_at).getTime()).toBeCloseTo(new Date().getTime(), -3);
    });

    test('should update content and return 200 for the content owner', async () => {
        const updatePayload = {
            title: 'Updated Title by Owner',
            tags: ['personal', 'draft']
        };

        // Mock 1: Fetch content for authorization check (returns content owned by the user)
        db.query.mockResolvedValueOnce([[{ id: contentId, created_by: ownerId, description: 'Original Description' }]]);

        // Mock 2: Transaction for updates
        db.query.mockResolvedValueOnce([{}]) // BEGIN
                .mockResolvedValueOnce([{}]) // DELETE from content_tags
                .mockResolvedValueOnce([[{ id: 'tag-uuid-4' }, { id: 'tag-uuid-5' }]]) // Find/Create tags
                .mockResolvedValueOnce([{}]) // INSERT into content_tags
                .mockResolvedValueOnce([{}]) // UPDATE content
                .mockResolvedValueOnce([{}]); // COMMIT

        const response = await request(app)
            .put(`/api/v1/knowledge-base/content/${contentId}`)
            .set('Authorization', `Bearer ${ownerToken}`)
            .send(updatePayload);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('content_id', contentId);
        expect(response.body).toHaveProperty('title', updatePayload.title);
        // Description should remain the same as it wasn't in the payload
        expect(response.body).toHaveProperty('description', 'Original Description');
        expect(response.body.tags).toEqual(expect.arrayContaining(updatePayload.tags));
    });

    // --- Error Scenarios ---
    test('should return 403 Forbidden if the user is not the owner or an admin', async () => {
        const updatePayload = {
            title: 'Forbidden Update Attempt'
        };

        // Mock: Fetch content for authorization check, showing it's owned by someone else
        db.query.mockResolvedValueOnce([[{ id: contentId, created_by: ownerId }]]);

        const response = await request(app)
            .put(`/api/v1/knowledge-base/content/${contentId}`)
            .set('Authorization', `Bearer ${otherUserToken}`)
            .send(updatePayload);

        expect(response.statusCode).toBe(403);
        expect(response.body).toEqual({ message: 'Forbidden - User is not the owner or an admin.' });
        // Ensure no update queries were run
        expect(db.query).toHaveBeenCalledTimes(1);
    });

    test('should return 404 Not Found if the contentId does not exist', async () => {
        const nonExistentId = '00000000-0000-0000-0000-000000000000';
        const updatePayload = {
            title: 'Update for Non-Existent Content'
        };

        // Mock: Fetch content returns an empty array, signifying 'not found'
        db.query.mockResolvedValueOnce([[]]);

        const response = await request(app)
            .put(`/api/v1/knowledge-base/content/${nonExistentId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(updatePayload);

        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({ message: 'Not Found.' });
    });

    test('should return 400 Bad Request if payload is invalid (e.g., tags is not an array)', async () => {
        const invalidPayload = {
            title: 'Valid Title',
            tags: 'this-is-not-an-array'
        };

        // Mock: The request should fail validation before any DB calls
        // This test assumes a validation middleware (like Joi or express-validator) is in use.

        const response = await request(app)
            .put(`/api/v1/knowledge-base/content/${contentId}`)
            .set('Authorization', `Bearer ${ownerToken}`)
            .send(invalidPayload);

        expect(response.statusCode).toBe(400);
        // The exact error message depends on the validation library used
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('"tags" must be an array');

        // No database interaction should have occurred
        expect(db.query).not.toHaveBeenCalled();
    });
});