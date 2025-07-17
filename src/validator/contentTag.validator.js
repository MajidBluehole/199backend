const Joi = require('joi');

// Schema for creating a content-tag association.
// Since this is a junction table, an 'update' operation is effectively a delete + create,
// so a separate update schema is not necessary.
const contentTagSchema = Joi.object({
  content_id: Joi.string().uuid({ version: 'uuidv4' }).required().messages({
    'string.base': 'Content ID must be a string.',
    'string.empty': 'Content ID cannot be empty.',
    'string.guid': 'Content ID must be a valid UUID.',
    'any.required': 'Content ID is required.',
  }),
  tag_id: Joi.string().uuid({ version: 'uuidv4' }).required().messages({
    'string.base': 'Tag ID must be a string.',
    'string.empty': 'Tag ID cannot be empty.',
    'string.guid': 'Tag ID must be a valid UUID.',
    'any.required': 'Tag ID is required.',
  }),
});


const validateContentTag = (data) => {
  return contentTagSchema.validate(data);
};

module.exports = {
  validateContentTag,
};
