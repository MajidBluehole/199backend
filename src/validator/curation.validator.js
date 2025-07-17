const Joi = require('joi');

// Schema for creating a new curation entry
const createCurationSchema = Joi.object({
  content_id: Joi.string().uuid({ version: 'uuidv4' }).required().messages({
    'string.base': 'Content ID must be a string.',
    'string.guid': 'Content ID must be a valid UUIDv4.',
    'any.required': 'Content ID is a required field.',
  }),
  rank_order: Joi.number().integer().min(0).default(0).messages({
    'number.base': 'Rank order must be a number.',
    'number.integer': 'Rank order must be an integer.',
    'number.min': 'Rank order must be 0 or greater.',
  }),
});

// Schema for updating an existing curation entry
// content_id is generally not updatable as it's a key identifier.
const updateCurationSchema = Joi.object({
  rank_order: Joi.number().integer().min(0).messages({
    'number.base': 'Rank order must be a number.',
    'number.integer': 'Rank order must be an integer.',
    'number.min': 'Rank order must be 0 or greater.',
  }),
}).min(1).messages({
    'object.min': 'At least one field must be provided for the update.'
});

module.exports = {
  createCurationSchema,
  updateCurationSchema,
};
