import Joi from 'joi';

// Base schema for the tag name for reusability and consistency
const tagName = Joi.string()
  .trim()
  .min(2)
  .max(100)
  .pattern(new RegExp('^[a-zA-Z0-9_\- ]+$'))
  .messages({
    'string.pattern.base': '"tagName" can only contain alphanumeric characters, spaces, underscores, and hyphens.'
  });

// Schema for validating the creation of a feedback tag
// All required fields must be present
export const createFeedbackTagSchema = Joi.object({
  tagName: tagName.required()
});

// Schema for validating updates to a feedback tag
// All fields are optional, but at least one must be provided
export const updateFeedbackTagSchema = Joi.object({
  tagName: tagName.optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for the update.'
});

// Schema for validating URL parameters, e.g., /feedback-tags/:tagId
export const tagIdParamSchema = Joi.object({
  tagId: Joi.number().integer().positive().required()
});
