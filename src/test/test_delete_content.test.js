const request = require('supertest');
const express = require('express');
const contentRoutes = require('../../../../src/routes/v1/knowledge-base/content'); // Assuming this is where the route is defined
const authMiddleware = require('../../../../src/middleware/auth'); // Mocked auth middleware
const db = require('../../../../src/database/mysql'); // Mocked DB module
const fileStorage = require('../../../../src/services/fileStorage'); // Mocked file storage service (e.g., S3)

// Mock dependencies
jest.mock('../../../../src/middleware/auth');
jest.mock('../../../../src/database/mysql');
jest.mock('../../../../src/services/fileStorage');

// Setup Express app for testing
const app = express();
app.use(express.json());
// A mock middleware to attach the user to the request for the route to use
app.use((req, res, next) => {
    // The actual authMiddleware mock will handle setting req.user
    authMiddleware(req, res, next);
});
app.use('/api/v1/knowledge-base/content', contentRoutes);

// Mock error handler to capture errors
app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({ message: err.message });
});

describe('DELETE /api/v1/knowledge-base/content/{contentId}', () => {
    const contentId = 'abc-123';
    const ownerUserId = 1;
    const adminUserId = 99;
    const otherUserId = 2;
    const filePath = 'uploads/knowledge/file.pdf';

    const mockContent = {
        id: contentId,
        uploader_id: ownerUserId,
        file_path: filePath,
        title: 'Test Content'
    };

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();

        // Default mock for auth middleware
        authMiddleware.mockImplementation((req, res, next) => {
            // This will be overridden in specific tests
            req.user = { id: adminUserId, role: 'admin' };
            next();
        });
    });

    describe('Successful Deletion', () => {
        test('should return 204 and delete content when user is an admin', async () => {
            // Arrange
            authMiddleware.mockImplementation((req, res, next) => {
                req.user = { id: adminUserId, role: 'admin' };
                next();
            });

            db.pool.query.mockResolvedValueOnce([ [mockContent] ]); // Find content
            fileStorage.deleteFile.mockResolvedValueOnce(); // Delete file from storage
            db.pool.query.mockResolvedValueOnce([ { affectedRows: 1 } ]); // Delete from DB

            // Act
            const response = await request(app).delete(`/api/v1/knowledge-base/content/${contentId}`);

            // Assert
            expect(response.status).toBe(204);
            expect(db.pool.query).toHaveBeenCalledWith(expect.stringContaining('SELECT'), [contentId]);
            expect(fileStorage.deleteFile).toHaveBeenCalledWith(filePath);
            expect(db.pool.query).toHaveBeenCalledWith(expect.stringContaining('DELETE'), [contentId]);
        });

        test('should return 204 and delete content when user is the owner', async () => {
            // Arrange
            authMiddleware.mockImplementation((req, res, next) => {
                req.user = { id: ownerUserId, role: 'user' };
                next();
            });

            db.pool.query.mockResolvedValueOnce([ [mockContent] ]);
            fileStorage.deleteFile.mockResolvedValueOnce();
            db.pool.query.mockResolvedValueOnce([ { affectedRows: 1 } ]);

            // Act
            const response = await request(app).delete(`/api/v1/knowledge-base/content/${contentId}`);

            // Assert
            expect(response.status).toBe(204);
            expect(fileStorage.deleteFile).toHaveBeenCalledWith(filePath);
            expect(db.pool.query).toHaveBeenCalledTimes(2);
        });
    });

    describe('Error Scenarios', () => {
        test('should return 404 Not Found if contentId does not exist', async () => {
            // Arrange
            const nonExistentId = 'not-found-id';
            db.pool.query.mockResolvedValueOnce([ [] ]); // Simulate content not found

            // Act
            const response = await request(app).delete(`/api/v1/knowledge-base/content/${nonExistentId}`);

            // Assert
            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Not Found.');
            expect(fileStorage.deleteFile).not.toHaveBeenCalled();
            expect(db.pool.query).toHaveBeenCalledTimes(1); // Only the SELECT query should run
        });

        test('should return 403 Forbidden if user is not the owner or an admin', async () => {
            // Arrange
            authMiddleware.mockImplementation((req, res, next) => {
                req.user = { id: otherUserId, role: 'user' };
                next();
            });

            db.pool.query.mockResolvedValueOnce([ [mockContent] ]); // Content exists but user is not owner

            // Act
            const response = await request(app).delete(`/api/v1/knowledge-base/content/${contentId}`);

            // Assert
            expect(response.status).toBe(403);
            expect(response.body.message).toBe('Forbidden - User is not the owner or an admin.');
            expect(fileStorage.deleteFile).not.toHaveBeenCalled();
            expect(db.pool.query).toHaveBeenCalledTimes(1); // Only the SELECT query should run
        });

        test('should handle database errors during fetch', async () => {
            // Arrange
            const dbError = new Error('Database connection failed');
            db.pool.query.mockRejectedValueOnce(dbError);

            // Act
            const response = await request(app).delete(`/api/v1/knowledge-base/content/${contentId}`);

            // Assert
            expect(response.status).toBe(500);
            expect(response.body.message).toBe('Database connection failed');
        });

        test('should handle file storage errors during deletion', async () => {
            // Arrange
            const storageError = new Error('S3 Access Denied');
            db.pool.query.mockResolvedValueOnce([ [mockContent] ]);
            fileStorage.deleteFile.mockRejectedValueOnce(storageError);

            // Act
            const response = await request(app).delete(`/api/v1/knowledge-base/content/${contentId}`);

            // Assert
            expect(response.status).toBe(500);
            expect(response.body.message).toBe('S3 Access Denied');
            // Ensure we didn't proceed to delete the DB record
            expect(db.pool.query).toHaveBeenCalledTimes(1);
        });
    });
});