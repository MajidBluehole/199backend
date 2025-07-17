const Joi = require('joi');

// Base schema for common fields
const baseSchema = {
  organizationId: Joi.string().uuid({ version: 'uuidv4' }).messages({
    'string.guid': 'organizationId must be a valid UUIDv4',
  }),
  keywordText: Joi.string().trim().min(1).max(255).messages({
    'string.base': 'keywordText must be a string',
    'string.empty': 'keywordText cannot be empty',
    'string.min': 'keywordText must be at least 1 character long',
    'string.max': 'keywordText cannot be longer than 255 characters',
  }),
  category: Joi.string().trim().max(100).allow(null, '').messages({
    'string.max': 'category cannot be longer than 100 characters',
  }),
};

// Schema for creating a new keyword
const createKeywordSchema = Joi.object({
  organizationId: baseSchema.organizationId.required().messages({
    'any.required': 'organizationId is required',
  }),
  keywordText: baseSchema.keywordText.required().messages({
    'any.required': 'keywordText is required',
  }),
  category: baseSchema.category,
}).options({ abortEarly: false, stripUnknown: true });

// Schema for updating an existing keyword
const updateKeywordSchema = Joi.object({
  keywordText: baseSchema.keywordText,
  category: baseSchema.category,
})
  .min(1) // Ensure at least one field is provided for an update
  .messages({
    'object.min': 'At least one field (keywordText or category) must be provided for an update.',
  })
  .options({ abortEarly: false, stripUnknown: true });

module.exports = {
  createKeywordSchema,
  updateKeywordSchema,
};