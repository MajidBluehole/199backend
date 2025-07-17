const request = require('supertest');
const express = require('express');
const { v4: uuidv4 } = require('uuid');

// Assuming the router is exported from a file like this
// The actual implementation of the router and controller would be in these files
const feedbackRouter = require('../../../src/api/v1/feedback/feedback.routes'); 
const authMiddleware = require('../../../src/middleware/auth');
const db = require('../../../src/lib/database');

// Mock dependencies
jest.mock('uuid');
jest.mock('../../../src/middleware/auth');
jest.mock('../../../src/lib/database');

// Setup a minimal Express app for testing the router
const app = express();
app.use(express.json());
// The auth middleware would be applied before the router in a real app
app.use('/api/v1/feedback', authMiddleware, feedbackRouter);

// A mock error handler to catch errors thrown by controllers
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

describe('POST /api/v1/feedback', () => {
    const mockUserId = 'user-id-12345';
    const mockRecommendationId = 'rec-abc-789-xyz';
    const mockFeedbackId = 'a2a1f4e2-8b0c-4d54-9e6a-1b2c3d4e5f6a';
    const mockOtherReasonId = 99;

    beforeEach(() => {
        // Reset mocks before each test to ensure isolation
        jest.clearAllMocks();

        // Default mock for successful authentication
        authMiddleware.mockImplementation((req, res, next) => {
            req.user = { id: mockUserId };
            next();
        });

        // Default mock for UUID generation
        uuidv4.mockReturnValue(mockFeedbackId);
    });

    describe('Success Scenarios', () => {
        it('should submit feedback with a positive rating and return 201', async () => {
            // Arrange
            const feedbackPayload = {
                recommendation_id: mockRecommendationId,
                rating: 5,
                feedback_text: 'This was a great recommendation!'
            };

            // Mock DB calls: 1. Check if recommendation exists, 2. Insert feedback
            db.query
                .mockResolvedValueOnce([[{ id: mockRecommendationId }]]) // Recommendation found
                .mockResolvedValueOnce([{ insertId: 1 }]); // Insert successful

            // Act
            const response = await request(app)
                .post('/api/v1/feedback')
                .send(feedbackPayload);

            // Assert
            expect(response.status).toBe(201);
            expect(response.body).toEqual({
                feedback_id: mockFeedbackId,
                message: 'Feedback submitted successfully.'
            });
            expect(db.query).toHaveBeenCalledTimes(2);
            expect(db.query).toHaveBeenCalledWith(
                'SELECT id FROM recommendations WHERE id = ?',
                [mockRecommendationId]
            );
            expect(db.query).toHaveBeenCalledWith(
                'INSERT INTO feedback_submissions (id, user_id, recommendation_id, rating, feedback_text, reason_id, custom_reason_text) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [mockFeedbackId, mockUserId, mockRecommendationId, 5, 'This was a great recommendation!', null, null]
            );
        });

        it('should submit feedback with a negative rating and a valid reason_id and return 201', async () => {
            // Arrange
            const feedbackPayload = {
                recommendation_id: mockRecommendationId,
                rating: 1,
                reason_id: 3, // e.g., 'Not relevant'
                feedback_text: 'This was not relevant to my issue.'
            };

            db.query
                .mockResolvedValueOnce([[{ id: mockRecommendationId }]]) // Recommendation exists
                .mockResolvedValueOnce([[{ id: 3, reason_text: 'Not relevant' }]]) // Reason exists and is not 'Other'
                .mockResolvedValueOnce([{ insertId: 2 }]); // Insert succeeds

            // Act
            const response = await request(app)
                .post('/api/v1/feedback')
                .send(feedbackPayload);

            // Assert
            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Feedback submitted successfully.');
            expect(db.query).toHaveBeenCalledWith(
                'INSERT INTO feedback_submissions (id, user_id, recommendation_id, rating, feedback_text, reason_id, custom_reason_text) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [mockFeedbackId, mockUserId, mockRecommendationId, 1, 'This was not relevant to my issue.', 3, null]
            );
        });

        it('should submit feedback with a negative rating, "Other" reason, and custom text, returning 201', async () => {
            // Arrange
            const feedbackPayload = {
                recommendation_id: mockRecommendationId,
                rating: 2,
                reason_id: mockOtherReasonId,
                custom_reason_text: 'The reason is very specific.'
            };

            db.query
                .mockResolvedValueOnce([[{ id: mockRecommendationId }]]) // Recommendation exists
                .mockResolvedValueOnce([[{ id: mockOtherReasonId, reason_text: 'Other' }]]) // Reason is 'Other'
                .mockResolvedValueOnce([{ insertId: 3 }]); // Insert succeeds

            // Act
            const response = await request(app)
                .post('/api/v1/feedback')
                .send(feedbackPayload);

            // Assert
            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Feedback submitted successfully.');
            expect(db.query).toHaveBeenCalledWith(
                'INSERT INTO feedback_submissions (id, user_id, recommendation_id, rating, feedback_text, reason_id, custom_reason_text) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [mockFeedbackId, mockUserId, mockRecommendationId, 2, null, mockOtherReasonId, 'The reason is very specific.']
            );
        });
    });

    describe('Error Scenarios', () => {
        it('should return 401 Unauthorized if user is not authenticated', async () => {
            // Arrange
            authMiddleware.mockImplementation((req, res, next) => {
                 // Simulate a real auth guard rejecting the request
                 res.status(401).json({ message: 'Unauthorized - User authentication failed.' });
            });

            // Act
            const response = await request(app)
                .post('/api/v1/feedback')
                .send({ recommendation_id: 'any', rating: 5 });

            // Assert
            expect(response.status).toBe(401);
            expect(response.body).toEqual({ message: 'Unauthorized - User authentication failed.' });
        });

        it('should return 404 Not Found if recommendation_id does not exist', async () => {
            // Arrange
            const feedbackPayload = {
                recommendation_id: 'non-existent-rec',
                rating: 5
            };
            db.query.mockResolvedValueOnce([[]]); // Simulate recommendation not found

            // Act
            const response = await request(app)
                .post('/api/v1/feedback')
                .send(feedbackPayload);

            // Assert
            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Not Found - The specified recommendation_id does not exist.' });
        });

        describe('Bad Request (400) Scenarios', () => {
            const testCases = [
                {
                    name: 'missing recommendation_id',
                    payload: { rating: 4 },
                },
                {
                    name: 'missing rating',
                    payload: { recommendation_id: mockRecommendationId },
                },
                {
                    name: 'invalid rating type (string)',
                    payload: { recommendation_id: mockRecommendationId, rating: 'five' },
                },
                {
                    name: 'negative rating (<=3) without reason_id',
                    payload: { recommendation_id: mockRecommendationId, rating: 2 },
                    setup: () => {
                        db.query.mockResolvedValueOnce([[{ id: mockRecommendationId }]]); // Rec exists
                    }
                },
                {
                    name: '"Other" reason without custom_reason_text',
                    payload: { recommendation_id: mockRecommendationId, rating: 1, reason_id: mockOtherReasonId },
                    setup: () => {
                        db.query
                            .mockResolvedValueOnce([[{ id: mockRecommendationId }]]) // Rec exists
                            .mockResolvedValueOnce([[{ id: mockOtherReasonId, reason_text: 'Other' }]]); // Reason is 'Other'
                    },
                }
            ];

            test.each(testCases)('should return 400 for $name', async ({ payload, setup }) => {
                // Arrange
                if (setup) setup();

                // Act
                const response = await request(app)
                    .post('/api/v1/feedback')
                    .send(payload);

                // Assert
                expect(response.status).toBe(400);
                expect(response.body).toEqual({ message: 'Bad Request - Missing required fields or invalid data.' });
            });
        });
    });
});