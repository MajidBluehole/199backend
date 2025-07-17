import Joi from 'joi';

const feedbackToTagSchema = {
  feedback_id: Joi.string().uuid({ version: 'uuidv4' })
    .messages({
      'string.base': 'Feedback ID must be a string.',
      'string.guid': 'Feedback ID must be a valid UUIDv4.',
      'any.required': 'Feedback ID is required.',
    }),
  tag_id: Joi.number().integer().positive()
    .messages({
      'number.base': 'Tag ID must be a number.',
      'number.integer': 'Tag ID must be an integer.',
      'number.positive': 'Tag ID must be a positive integer.',
      'any.required': 'Tag ID is required.',
    }),
};


export const createFeedbackToTagValidator = Joi.object({
  feedback_id: feedbackToTagSchema.feedback_id.required(),
  tag_id: feedbackToTagSchema.tag_id.required(),
});


export const updateFeedbackToTagValidator = Joi.object({
  feedback_id: feedbackToTagSchema.feedback_id.required(),
  tag_id: feedbackToTagSchema.tag_id.required(),
});
