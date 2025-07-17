import Joi from 'joi';

const tagFields = {
  tagName: Joi.string()
    .trim()
    .max(100)
    .pattern(/^[a-z0-9-]+$/)
    .messages({
      'string.base': 'Tag name must be a string.',
      'string.empty': 'Tag name is required.',
      'string.max': 'Tag name must not exceed 100 characters.',
      'string.pattern.base': 'Tag name can only contain lowercase letters, numbers, and hyphens.',
    }),
  name: Joi.string()
    .trim()
    .max(50)
    .messages({
      'string.base': 'Name must be a string.',
      'string.empty': 'Name is required.',
      'string.max': 'Name must not exceed 50 characters.',
    }),
};


export const createTagSchema = Joi.object({
  tagName: tagFields.tagName.required(),
  name: tagFields.name.required(),
});


export const updateTagSchema = Joi.object({
  tagName: tagFields.tagName,
  name: tagFields.name,
}).min(1).messages({
  'object.min': 'At least one field (tagName, name) must be provided for an update.',
});
