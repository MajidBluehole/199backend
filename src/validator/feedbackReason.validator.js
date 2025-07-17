const Joi = require('joi');

const createFeedbackReasonSchema = Joi.object({
  reasonText: Joi.string()
    .trim()
    .max(255)
    .required()
    .messages({
      'string.base': 'Reason text must be a string.',
      'string.empty': 'Reason text cannot be empty.',
      'string.max': 'Reason text must not exceed 255 characters.',
      'any.required': 'Reason text is required.'
    }),
  isActive: Joi.boolean()
    .optional()
    .default(true)
    .messages({
      'boolean.base': 'Is active must be a boolean value (true or false).'
    })
});

const updateFeedbackReasonSchema = Joi.object({
  reasonText: Joi.string()
    .trim()
    .max(255)
    .optional()
    .messages({
      'string.base': 'Reason text must be a string.',
      'string.empty': 'Reason text cannot be empty.',
      'string.max': 'Reason text must not exceed 255 characters.'
    }),
  isActive: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Is active must be a boolean value (true or false).'
    })
}).min(1).messages({ // Ensure at least one field is being updated
    'object.min': 'At least one field must be provided for the update.'
});

module.exports = {
  createFeedbackReasonSchema,
  updateFeedbackReasonSchema
};