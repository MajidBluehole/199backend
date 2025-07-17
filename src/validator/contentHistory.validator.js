const Joi = require('joi');

// Schema for creating a new content history record.
// History records are immutable, so this is the primary validation schema.
const createContentHistorySchema = Joi.object({
  content_id: Joi.string().uuid({ version: 'uuidv4' }).required().messages({
    'string.guid': 'Content ID must be a valid UUID.',
    'any.required': 'Content ID is required.',
  }),
  version: Joi.number().integer().min(1).required().messages({
    'number.base': 'Version must be a number.',
    'number.integer': 'Version must be an integer.',
    'number.min': 'Version must be at least 1.',
    'any.required': 'Version is required.',
  }),
  title: Joi.string().trim().min(1).max(255).required().messages({
    'string.empty': 'Title is required.',
    'string.min': 'Title must be at least 1 character long.',
    'string.max': 'Title cannot be longer than 255 characters.',
    'any.required': 'Title is required.',
  }),
  body: Joi.string().trim().allow(null, '').optional(),
  change_author_id: Joi.string().uuid({ version: 'uuidv4' }).required().messages({
    'string.guid': 'Change Author ID must be a valid UUID.',
    'any.required': 'Change Author ID is required.',
  }),
});

// Schema for updating a content history record.
// NOTE: Updating history records is an anti-pattern. This schema is provided
// for completeness but its use should be carefully considered. It makes all fields optional.
const updateContentHistorySchema = Joi.object({
  title: Joi.string().trim().min(1).max(255).optional().messages({
    'string.min': 'Title must be at least 1 character long.',
    'string.max': 'Title cannot be longer than 255 characters.',
  }),
  body: Joi.string().trim().allow(null, '').optional(),
}).min(1); // Require at least one field to be updated

module.exports = {
  createContentHistorySchema,
  updateContentHistorySchema,
};