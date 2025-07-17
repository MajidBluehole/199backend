const request = require('supertest');
const express = require('express');
const { v4: uuidv4 } = require('uuid');

// Assuming the router is defined in a separate file
// We will mock the controller and services it depends on
const contentRoutes = require('../../../../routes/v1/knowledge-base/content');

// Mock dependencies
const contentController = require('../../../../controllers/v1/knowledge-base/contentController');
const authMiddleware = require('../../../../middleware/auth'); // Assuming an auth middleware exists

// Mock the actual implementations of controller methods
jest.mock('../../../../controllers/v1/knowledge-base/contentController');
// Mock the auth middleware to automatically authenticate
jest.mock('../../../../middleware/auth', () => jest.fn((req, res, next) => next()));

const app = express();
app.use(express.json());
// Mount the router under test
app.use('/api/v1/knowledge-base/content', contentRoutes);

// Centralized error handler for the test app
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ message: err.message || 'An unexpected error occurred.' });
});

describe('GET /api/v1/knowledge-base/content/:contentId/download', () => {

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
    });

    describe('Successful Scenarios', () => {
        it('should return 200 with a download URL for a valid content ID', async () => {
            // Arrange
            const contentId = uuidv4();
            const mockResponse = {
                download_url: `https://s3.amazonaws.com/bucket/some-file.pdf?sig=123&expires=456`,
                expires_in: 3600
            };

            contentController.getDownloadUrl.mockImplementation(async (req, res, next) => {
                res.status(200).json(mockResponse);
            });

            // Act
            const response = await request(app)
                .get(`/api/v1/knowledge-base/content/${contentId}/download`);

            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockResponse);
            expect(response.headers['content-type']).toMatch(/json/);
            expect(contentController.getDownloadUrl).toHaveBeenCalledTimes(1);
            expect(authMiddleware).toHaveBeenCalledTimes(1);
        });
    });

    describe('Error Scenarios', () => {
        it('should return 404 Not Found when the content ID does not exist', async () => {
            // Arrange
            const nonExistentContentId = uuidv4();
            const error = new Error('Not Found.');
            error.statusCode = 404;

            contentController.getDownloadUrl.mockImplementation(async (req, res, next) => {
                next(error);
            });

            // Act
            const response = await request(app)
                .get(`/api/v1/knowledge-base/content/${nonExistentContentId}/download`);

            // Assert
            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Not Found.');
            expect(contentController.getDownloadUrl).toHaveBeenCalledTimes(1);
        });

        it('should return 400 Bad Request for an invalid content ID format (e.g., not a UUID)', async () => {
            // Arrange
            const invalidContentId = 'not-a-uuid';
            // Assuming a validation middleware or controller logic would catch this
            const error = new Error('Invalid content ID format.');
            error.statusCode = 400;

            contentController.getDownloadUrl.mockImplementation(async (req, res, next) => {
                // In a real app, this might be handled by a validation middleware before the controller
                next(error);
            });

            // Act
            const response = await request(app)
                .get(`/api/v1/knowledge-base/content/${invalidContentId}/download`);

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Invalid content ID format.');
        });

        it('should return 500 Internal Server Error if the database operation fails', async () => {
            // Arrange
            const contentId = uuidv4();
            const error = new Error('Database connection lost.');
            error.statusCode = 500;

            contentController.getDownloadUrl.mockImplementation(async (req, res, next) => {
                next(error);
            });

            // Act
            const response = await request(app)
                .get(`/api/v1/knowledge-base/content/${contentId}/download`);

            // Assert
            expect(response.status).toBe(500);
            expect(response.body.message).toBe('Database connection lost.');
        });

        it('should return 500 Internal Server Error if the pre-signed URL generation fails', async () => {
            // Arrange
            const contentId = uuidv4();
            const error = new Error('Failed to generate signed URL from storage service.');
            error.statusCode = 500;

            contentController.getDownloadUrl.mockImplementation(async (req, res, next) => {
                next(error);
            });

            // Act
            const response = await request(app)
                .get(`/api/v1/knowledge-base/content/${contentId}/download`);

            // Assert
            expect(response.status).toBe(500);
            expect(response.body.message).toBe('Failed to generate signed URL from storage service.');
        });
    });
});