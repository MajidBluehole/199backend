const Joi = require('joi');

// Schema for creating a new custom field option
const createCustomFieldOptionSchema = Joi.object({
  customFieldId: Joi.string().uuid({ version: 'uuidv4' }).required().messages({
    'string.base': 'Custom Field ID must be a string.',
    'string.guid': 'Custom Field ID must be a valid UUIDv4.',
    'any.required': 'Custom Field ID is required.'
  }),
  value: Joi.string().trim().min(1).max(255).required().messages({
    'string.base': 'Value must be a string.',
    'string.empty': 'Value cannot be empty.',
    'string.min': 'Value must be at least 1 character long.',
    'string.max': 'Value must not exceed 255 characters.',
    'any.required': 'Value is required.'
  }),
  displayOrder: Joi.number().integer().required().messages({
    'number.base': 'Display Order must be a number.',
    'number.integer': 'Display Order must be an integer.',
    'any.required': 'Display Order is required.'
  })
});

// Schema for updating an existing custom field option
// Note: customFieldId is typically not updatable.
const updateCustomFieldOptionSchema = Joi.object({
  value: Joi.string().trim().min(1).max(255).messages({
    'string.base': 'Value must be a string.',
    'string.empty': 'Value cannot be empty.',
    'string.min': 'Value must be at least 1 character long.',
    'string.max': 'Value must not exceed 255 characters.'
  }),
  displayOrder: Joi.number().integer().messages({
    'number.base': 'Display Order must be a number.',
    'number.integer': 'Display Order must be an integer.'
  })
}).min(1).messages({ // Ensures that at least one field is being updated
  'object.min': 'Request body must contain at least one field to update.'
});

module.exports = {
  createCustomFieldOptionSchema,
  updateCustomFieldOptionSchema
};
