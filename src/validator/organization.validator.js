const Joi = require('joi');

const createOrganizationSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(255)
    .required()
    .messages({
      'string.base': '"name" should be a type of text',
      'string.empty': '"name" cannot be an empty field',
      'string.min': '"name" should have a minimum length of {#limit}',
      'string.max': '"name" should have a maximum length of {#limit}',
      'any.required': '"name" is a required field'
    })
});

const updateOrganizationSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(255)
    .optional()
    .messages({
        'string.base': '"name" should be a type of text',
        'string.min': '"name" should have a minimum length of {#limit}',
        'string.max': '"name" should have a maximum length of {#limit}'
    })
}).min(1); // Ensure at least one field is provided for update

module.exports = {
  createOrganizationSchema,
  updateOrganizationSchema
};