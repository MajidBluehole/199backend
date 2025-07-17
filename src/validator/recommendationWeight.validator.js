const Joi = require('joi');

const createRecommendationWeightSchema = Joi.object({
  organizationId: Joi.string().uuid({
    version: ['uuidv4']
  }).required().messages({
    'string.guid': 'organizationId must be a valid UUIDv4',
    'any.required': 'organizationId is required'
  }),
  attributeKey: Joi.string().max(100).required().messages({
    'string.max': 'attributeKey must not exceed 100 characters',
    'any.required': 'attributeKey is required'
  }),
  displayName: Joi.string().max(255).required().messages({
    'string.max': 'displayName must not exceed 255 characters',
    'any.required': 'displayName is required'
  }),
  weight: Joi.number().integer().min(0).max(100).default(50).messages({
    'number.base': 'Weight must be a number',
    'number.integer': 'Weight must be an integer',
    'number.min': 'Weight must be at least 0',
    'number.max': 'Weight must be at most 100'
  })
});

const updateRecommendationWeightSchema = Joi.object({
  displayName: Joi.string().max(255).messages({
    'string.max': 'displayName must not exceed 255 characters'
  }),
  weight: Joi.number().integer().min(0).max(100).messages({
    'number.base': 'Weight must be a number',
    'number.integer': 'Weight must be an integer',
    'number.min': 'Weight must be at least 0',
    'number.max': 'Weight must be at most 100'
  })
}).min(1); // Require at least one field to be updated

module.exports = {
  createRecommendationWeightSchema,
  updateRecommendationWeightSchema,
};