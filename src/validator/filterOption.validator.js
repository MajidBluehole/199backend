const Joi = require('joi');

const createFilterOptionSchema = Joi.object({
  categoryName: Joi.string().max(255).required().messages({
    'string.base': 'Category name must be a string.',
    'string.max': 'Category name cannot exceed 255 characters.',
    'any.required': 'Category name is required.'
  }),
  value: Joi.string().max(255).required().messages({
    'string.base': 'Value must be a string.',
    'string.max': 'Value cannot exceed 255 characters.',
    'any.required': 'Value is required.'
  }),
  displayOrder: Joi.number().integer().required().messages({
    'number.base': 'Display order must be a number.',
    'number.integer': 'Display order must be an integer.',
    'any.required': 'Display order is required.'
  })
});

const updateFilterOptionSchema = Joi.object({
  categoryName: Joi.string().max(255).messages({
    'string.base': 'Category name must be a string.',
    'string.max': 'Category name cannot exceed 255 characters.'
  }),
  value: Joi.string().max(255).messages({
    'string.base': 'Value must be a string.',
    'string.max': 'Value cannot exceed 255 characters.'
  }),
  displayOrder: Joi.number().integer().messages({
    'number.base': 'Display order must be a number.',
    'number.integer': 'Display order must be an integer.'
  })
}).min(1).messages({ // Ensures at least one field is being updated
    'object.min': 'At least one field must be provided for the update.'
});

module.exports = {
  createFilterOptionSchema,
  updateFilterOptionSchema
};