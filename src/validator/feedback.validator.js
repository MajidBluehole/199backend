const Joi = require('joi');

const feedbackFields = {
  user_id: Joi.string().uuid({ version: 'uuidv4' }).optional().allow(null).messages({
    'string.guid': 'user_id must be a valid UUIDv4',
  }),
  recommendation_id: Joi.string().uuid({ version: 'uuidv4' }).messages({
    'string.guid': 'recommendation_id must be a valid UUIDv4',
  }),
  recommendation_category: Joi.string().max(100).messages({
    'string.max': 'recommendation_category cannot exceed 100 characters',
  }),
  feedback_type: Joi.string().valid('helpful', 'not_helpful', 'incorrect').messages({
    'any.only': 'feedback_type must be one of [helpful, not_helpful, incorrect]',
  }),
  comment: Joi.string().optional().allow(null, ''),
  status: Joi.string().valid('new', 'reviewed', 'actioned').messages({
    'any.only': 'status must be one of [new, reviewed, actioned]',
  }),
};

const createFeedbackValidator = Joi.object({
  user_id: feedbackFields.user_id,
  recommendation_id: feedbackFields.recommendation_id.required(),
  recommendation_category: feedbackFields.recommendation_category.required(),
  feedback_type: feedbackFields.feedback_type.required(),
  comment: feedbackFields.comment,
  status: feedbackFields.status, // Optional on create, defaults to 'new' in DB
});

const updateFeedbackValidator = Joi.object({
  // All fields are optional for an update, but at least one must be present.
  user_id: feedbackFields.user_id,
  recommendation_id: feedbackFields.recommendation_id,
  recommendation_category: feedbackFields.recommendation_category,
  feedback_type: feedbackFields.feedback_type,
  comment: feedbackFields.comment,
  status: feedbackFields.status,
}).min(1).messages({
  'object.min': 'At least one field must be provided to update.',
});

module.exports = {
  createFeedbackValidator,
  updateFeedbackValidator,
};
