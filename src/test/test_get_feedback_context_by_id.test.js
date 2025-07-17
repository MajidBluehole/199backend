const request = require('supertest');
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');

// --- Start of Mocked Application Structure ---
// In a real project, these would be in separate files.

// Mock Database Service
const db = {
    pool: {
        query: jest.fn(),
    },
};

// Mock Auth Middleware
// This mock allows us to simulate both success and failure.
const authMiddleware = {
    requireAuth: jest.fn((req, res, next) => next()),
};

// Validation Middleware (using Joi)
const validate = (schema) => (req, res, next) => {
    const toValidate = {};
    if (schema.params) toValidate.params = req.params;
    if (schema.body) toValidate.body = req.body;
    if (schema.query) toValidate.query = req.query;

    const { error } = Joi.object(schema).validate(toValidate, { abortEarly: false });

    if (error) {
        const errorMessage = error.details.map((d) => d.message).join(', ');
        const err = new Error(errorMessage);
        err.statusCode = 400;
        return next(err);
    }
    next();
};

// Controller Logic (the code we are testing)
const getFeedbackContext = async (req, res, next) => {
    try {
        const { recommendation_id } = req.params;
        const [rows] = await db.pool.query(
            'SELECT id, recommendation, source_system, created_at FROM recommendations WHERE id = ?',
            [recommendation_id]
        );

        if (!rows || rows.length === 0) {
            const error = new Error('Not Found - The specified recommendation_id does not exist.');
            error.statusCode = 404;
            return next(error);
        }

        const recommendation = rows[0];

        res.status(200).json({
            recommendation_id: recommendation.id,
            recommendation_text: recommendation.recommendation,
            source_system: recommendation.source_system,
            generated_at: recommendation.created_at,
        });
    } catch (error) {
        next(error);
    }
};

// Router
const feedbackRouter = express.Router();
const getContextSchema = {
    params: Joi.object({
        recommendation_id: Joi.string().uuid({ version: 'uuidv4' }).required(),
    }),
};
feedbackRouter.get(
    '/context/:recommendation_id',
    (req, res, next) => authMiddleware.requireAuth(req, res, next), // Use the mock
    validate(getContextSchema),
    getFeedbackContext
);

// Express App Setup
const app = express();
app.use(express.json());
app.use('/api/v1/feedback', feedbackRouter);

// Generic Error Handler
app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({ message: err.message || 'Internal Server Error' });
});

// --- End of Mocked Application Structure ---

describe('GET /api/v1/feedback/context/:recommendation_id', () => {
    let mockRecommendation;

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
        db.pool.query.mockClear();
        authMiddleware.requireAuth.mockImplementation((req, res, next) => next());

        const generatedAt = new Date();
        mockRecommendation = {
            id: uuidv4(),
            recommendation: 'This is a test recommendation.',
            source_system: 'CRM',
            created_at: generatedAt.toISOString(),
        };
    });

    test('should return 200 and the recommendation context for a valid ID', async () => {
        // Arrange
        db.pool.query.mockResolvedValue([[mockRecommendation]]);

        // Act
        const response = await request(app)
            .get(`/api/v1/feedback/context/${mockRecommendation.id}`);

        // Assert
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            recommendation_id: mockRecommendation.id,
            recommendation_text: mockRecommendation.recommendation,
            source_system: mockRecommendation.source_system,
            generated_at: mockRecommendation.created_at,
        });
        expect(db.pool.query).toHaveBeenCalledTimes(1);
        expect(db.pool.query).toHaveBeenCalledWith(
            expect.stringContaining('SELECT id, recommendation, source_system, created_at FROM recommendations WHERE id = ?'),
            [mockRecommendation.id]
        );
    });

    test('should return 404 Not Found if the recommendation_id does not exist', async () => {
        // Arrange
        const nonExistentId = uuidv4();
        db.pool.query.mockResolvedValue([[]]); // Simulate no record found

        // Act
        const response = await request(app)
            .get(`/api/v1/feedback/context/${nonExistentId}`);

        // Assert
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'Not Found - The specified recommendation_id does not exist.' });
        expect(db.pool.query).toHaveBeenCalledTimes(1);
    });

    test('should return 401 Unauthorized if authentication fails', async () => {
        // Arrange
        const unauthorizedError = new Error('Unauthorized - User authentication failed.');
        unauthorizedError.statusCode = 401;
        authMiddleware.requireAuth.mockImplementation((req, res, next) => {
            next(unauthorizedError);
        });

        const anyId = uuidv4();

        // Act
        const response = await request(app)
            .get(`/api/v1/feedback/context/${anyId}`);

        // Assert
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: 'Unauthorized - User authentication failed.' });
        expect(db.pool.query).not.toHaveBeenCalled(); // The controller should not be reached
    });

    test('should return 400 Bad Request for an invalid UUID format', async () => {
        // Arrange
        const invalidId = 'not-a-valid-uuid';

        // Act
        const response = await request(app)
            .get(`/api/v1/feedback/context/${invalidId}`);

        // Assert
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('"recommendation_id" must be a valid GUID');
        expect(db.pool.query).not.toHaveBeenCalled(); // The controller should not be reached
    });
});