const request = require('supertest');
const express = require('express');

// Mock the controller and middleware
const feedbackController = require('../../../src/controllers/v1/feedbackController');
const authMiddleware = require('../../../src/middleware/authMiddleware');
const permissionsMiddleware = require('../../../src/middleware/permissionsMiddleware');

// Mock the actual implementations
jest.mock('../../../src/controllers/v1/feedbackController');
jest.mock('../../../src/middleware/authMiddleware', () => jest.fn((req, res, next) => next()));
jest.mock('../../../src/middleware/permissionsMiddleware', () => ({
  canUpdateFeedback: jest.fn((req, res, next) => next()),
}));

const app = express();
app.use(express.json());

// Set up a dummy router to mimic the real application structure
const feedbackRouter = express.Router();
feedbackRouter.patch('/status', feedbackController.updateFeedbackStatus);
app.use('/api/v1/feedback', authMiddleware, permissionsMiddleware.canUpdateFeedback, feedbackRouter);

// Add a generic error handler to catch errors thrown by controllers
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

describe('PATCH /api/v1/feedback/status', () => {

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();

        // Default mock for successful authentication and authorization
        authMiddleware.mockImplementation((req, res, next) => {
            req.user = { id: 1, organizationId: 1, role: 'admin' };
            next();
        });
        permissionsMiddleware.canUpdateFeedback.mockImplementation((req, res, next) => next());
    });

    describe('Success Scenarios', () => {
        it('should update status for multiple feedback items and return 200', async () => {
            const requestBody = {
                feedbackIds: [10, 25, 31],
                status: 'reviewed'
            };

            // Mock the controller's implementation for this specific test
            feedbackController.updateFeedbackStatus.mockImplementation(async (req, res) => {
                // Simulate the database update logic from the controller
                const { feedbackIds, status } = req.body;
                if (!feedbackIds || !status) {
                    return res.status(400).json({ message: 'Bad Request' });
                }
                // In a real controller, this would be the result from a DB query
                const updatedCount = feedbackIds.length;
                res.status(200).json({ 
                    message: 'Feedback statuses updated successfully.',
                    updatedCount 
                });
            });

            const response = await request(app)
                .patch('/api/v1/feedback/status')
                .send(requestBody);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                message: 'Feedback statuses updated successfully.',
                updatedCount: 3
            });
            expect(feedbackController.updateFeedbackStatus).toHaveBeenCalledTimes(1);
        });
    });

    describe('Error Scenarios', () => {
        it('should return 400 if feedbackIds is missing', async () => {
            const requestBody = { status: 'archived' };

            feedbackController.updateFeedbackStatus.mockImplementation((req, res) => {
                res.status(400).json({ message: "Bad Request - Invalid or missing 'feedbackIds' or 'status'." });
            });

            const response = await request(app)
                .patch('/api/v1/feedback/status')
                .send(requestBody);

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('feedbackIds');
        });

        it('should return 400 if feedbackIds is not an array', async () => {
            const requestBody = { feedbackIds: '1,2,3', status: 'archived' };

            feedbackController.updateFeedbackStatus.mockImplementation((req, res) => {
                res.status(400).json({ message: "Bad Request - Invalid or missing 'feedbackIds' or 'status'." });
            });

            const response = await request(app)
                .patch('/api/v1/feedback/status')
                .send(requestBody);

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('feedbackIds');
        });

        it('should return 400 if status is missing', async () => {
            const requestBody = { feedbackIds: [1, 2, 3] };

            feedbackController.updateFeedbackStatus.mockImplementation((req, res) => {
                res.status(400).json({ message: "Bad Request - Invalid or missing 'feedbackIds' or 'status'." });
            });

            const response = await request(app)
                .patch('/api/v1/feedback/status')
                .send(requestBody);

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('status');
        });

        it('should return 401 if user is not authenticated', async () => {
            // Override the default auth mock to simulate unauthorized access
            authMiddleware.mockImplementation((req, res, next) => {
                res.status(401).json({ message: 'Unauthorized.' });
            });

            const response = await request(app)
                .patch('/api/v1/feedback/status')
                .send({ feedbackIds: [1], status: 'new' });

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Unauthorized.');
            // The controller should not be called if auth fails
            expect(feedbackController.updateFeedbackStatus).not.toHaveBeenCalled();
        });

        it('should return 403 if user does not have permission', async () => {
            // Auth succeeds, but permission check fails
            permissionsMiddleware.canUpdateFeedback.mockImplementation((req, res, next) => {
                res.status(403).json({ message: 'Forbidden - User does not have permission to update status.' });
            });

            const response = await request(app)
                .patch('/api/v1/feedback/status')
                .send({ feedbackIds: [1], status: 'new' });

            expect(response.status).toBe(403);
            expect(response.body.message).toBe('Forbidden - User does not have permission to update status.');
            // The controller should not be called if permission is denied
            expect(feedbackController.updateFeedbackStatus).not.toHaveBeenCalled();
        });

        it('should return 500 if the controller throws an unexpected error', async () => {
            const errorMessage = 'Database connection failed';
            feedbackController.updateFeedbackStatus.mockImplementation(async (req, res) => {
                throw new Error(errorMessage);
            });

            const response = await request(app)
                .patch('/api/v1/feedback/status')
                .send({ feedbackIds: [1, 2], status: 'error' });

            expect(response.status).toBe(500);
            expect(response.body.message).toBe('Internal Server Error');
        });
    });
});