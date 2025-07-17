const Joi = require('joi');

const createAnalysisSchema = Joi.object({
  interaction_id: Joi.string().uuid({ version: 'uuidv4' }).required().messages({
    'string.base': 'Interaction ID must be a string.',
    'string.guid': 'Interaction ID must be a valid UUIDv4.',
    'any.required': 'Interaction ID is required.',
  }),
  summary: Joi.string().allow(null, '').max(65535).optional().messages({
    'string.base': 'Summary must be a string.',
    'string.max': 'Summary must be less than 65535 characters.',
  }),
  status: Joi.string().valid('PENDING', 'COMPLETED', 'FAILED').optional().messages({
    'string.base': 'Status must be a string.',
    'any.only': 'Status must be one of [PENDING, COMPLETED, FAILED].',
  }),
  error_message: Joi.string().allow(null, '').max(65535).optional().messages({
    'string.base': 'Error message must be a string.',
    'string.max': 'Error message must be less than 65535 characters.',
  }),
});

const updateAnalysisSchema = Joi.object({
  summary: Joi.string().allow(null, '').max(65535).optional().messages({
    'string.base': 'Summary must be a string.',
    'string.max': 'Summary must be less than 65535 characters.',
  }),
  status: Joi.string().valid('PENDING', 'COMPLETED', 'FAILED').optional().messages({
    'string.base': 'Status must be a string.',
    'any.only': 'Status must be one of [PENDING, COMPLETED, FAILED].',
  }),
  error_message: Joi.string().allow(null, '').max(65535).optional().messages({
    'string.base': 'Error message must be a string.',
    'string.max': 'Error message must be less than 65535 characters.',
  }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for the update.',
});

module.exports = {
  createAnalysisSchema,
  updateAnalysisSchema,
};