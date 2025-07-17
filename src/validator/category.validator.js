import Joi from 'joi';

const createCategorySchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.base': 'Name must be a string.',
      'string.empty': 'Name is required.',
      'string.min': 'Name must be at least {#limit} characters long.',
      'string.max': 'Name cannot be more than {#limit} characters long.',
      'any.required': 'Name is required.'
    }),
  description: Joi.string()
    .trim()
    .allow(null, '')
    .optional()
    .messages({
      'string.base': 'Description must be a string.'
    })
});

const updateCategorySchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .optional()
    .messages({
      'string.base': 'Name must be a string.',
      'string.min': 'Name must be at least {#limit} characters long.',
      'string.max': 'Name cannot be more than {#limit} characters long.'
    }),
  description: Joi.string()
    .trim()
    .allow(null, '')
    .optional()
    .messages({
      'string.base': 'Description must be a string.'
    })
}).min(1).messages({ 'object.min': 'At least one field must be provided for update.' });

const categoryIdParamSchema = Joi.object({
    categoryId: Joi.string().uuid({ version: 'uuidv4' }).required().messages({
        'string.base': 'Category ID must be a string.',
        'string.guid': 'Category ID must be a valid UUID.',
        'any.required': 'Category ID is required in URL parameters.'
    })
});

export {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema
};
