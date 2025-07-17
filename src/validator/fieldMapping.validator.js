const Joi = require('joi');

// Validation schema for creating a field mapping
const createFieldMappingSchema = Joi.object({
  connectedDataSourceId: Joi.string().uuid({ version: 'uuidv4' }).required()
    .messages({
      'string.base': 'Connected Data Source ID must be a string.',
      'string.guid': 'Connected Data Source ID must be a valid UUIDv4.',
      'any.required': 'Connected Data Source ID is required.',
    }),
  sourceFieldPath: Joi.string().trim().max(255).required()
    .messages({
      'string.base': 'Source Field Path must be a string.',
      'string.empty': 'Source Field Path cannot be empty.',
      'string.max': 'Source Field Path must not exceed 255 characters.',
      'any.required': 'Source Field Path is required.',
    }),
  relaivaintMasterField: Joi.string().trim().max(255).required()
    .messages({
      'string.base': 'Relaivaint Master Field must be a string.',
      'string.empty': 'Relaivaint Master Field cannot be empty.',
      'string.max': 'Relaivaint Master Field must not exceed 255 characters.',
      'any.required': 'Relaivaint Master Field is required.',
    }),
  isActive: Joi.boolean().default(true)
    .messages({
      'boolean.base': 'Is Active must be a boolean value (true or false).',
    }),
});

// Validation schema for updating a field mapping
const updateFieldMappingSchema = Joi.object({
  connectedDataSourceId: Joi.string().uuid({ version: 'uuidv4' })
    .messages({
      'string.base': 'Connected Data Source ID must be a string.',
      'string.guid': 'Connected Data Source ID must be a valid UUIDv4.',
    }),
  sourceFieldPath: Joi.string().trim().max(255)
    .messages({
      'string.base': 'Source Field Path must be a string.',
      'string.empty': 'Source Field Path cannot be empty.',
      'string.max': 'Source Field Path must not exceed 255 characters.',
    }),
  relaivaintMasterField: Joi.string().trim().max(255)
    .messages({
      'string.base': 'Relaivaint Master Field must be a string.',
      'string.empty': 'Relaivaint Master Field cannot be empty.',
      'string.max': 'Relaivaint Master Field must not exceed 255 characters.',
    }),
  isActive: Joi.boolean()
    .messages({
      'boolean.base': 'Is Active must be a boolean value (true or false).',
    }),
}).min(1).messages({ // Ensure at least one field is provided for update
    'object.min': 'At least one field must be provided for the update.'
});

module.exports = {
  createFieldMappingSchema,
  updateFieldMappingSchema,
};