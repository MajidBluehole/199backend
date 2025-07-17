const Joi = require('joi');

// Base schema with all possible fields and their basic validations
const baseSchema = {
    userId: Joi.string().guid({ version: 'uuidv4' }),
    recommendationId: Joi.string().guid({ version: 'uuidv4' }).allow(null),
    ratingType: Joi.string().valid('thumbs', 'stars'),
    ratingValue: Joi.number().integer(),
    reasonId: Joi.number().integer().positive().allow(null),
    customReasonText: Joi.string().max(65535).allow(null, ''),
    comments: Joi.string().max(65535).allow(null, ''),
    submissionStatus: Joi.string().valid('synced', 'pending_sync')
};

// Schema for creating a new feedback submission
const createFeedbackSubmissionSchema = Joi.object(baseSchema).keys({
    userId: baseSchema.userId.required(),
    ratingType: baseSchema.ratingType.required(),
    ratingValue: baseSchema.ratingValue.required(),
    submissionStatus: baseSchema.submissionStatus.default('synced')
}).when(Joi.object({ ratingType: Joi.exist() }).unknown(), {
    // Conditional validation for ratingValue based on ratingType
    switch: [
        {
            is: { ratingType: 'stars' },
            then: Joi.object({ ratingValue: Joi.number().integer().min(1).max(5) })
        },
        {
            is: { ratingType: 'thumbs' },
            then: Joi.object({ ratingValue: Joi.number().integer().valid(1, -1) }) // e.g., 1 for up, -1 for down
        }
    ]
});

// Schema for updating an existing feedback submission (e.g., PATCH request)
// All fields are optional
const updateFeedbackSubmissionSchema = Joi.object(baseSchema).when(Joi.object({ ratingType: Joi.exist() }).unknown(), {
    // Conditional validation for ratingValue based on ratingType, if ratingType is provided
    switch: [
        {
            is: { ratingType: 'stars' },
            then: Joi.object({ ratingValue: Joi.number().integer().min(1).max(5) })
        },
        {
            is: { ratingType: 'thumbs' },
            then: Joi.object({ ratingValue: Joi.number().integer().valid(1, -1) })
        }
    ]
});

module.exports = {
    createFeedbackSubmissionSchema,
    updateFeedbackSubmissionSchema
};