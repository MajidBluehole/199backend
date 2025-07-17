import Joi from 'joi';

const recommendationBaseSchema = {
  source_system: Joi.string()
    .trim()
    .max(50)
    .messages({
      'string.base': 'Source system must be a string.',
      'string.empty': 'Source system cannot be empty.',
      'string.max': 'Source system must not exceed 50 characters.',
    }),
  source_context_id: Joi.string()
    .trim()
    .max(255)
    .allow(null, '')
    .messages({
      'string.base': 'Source context ID must be a string.',
      'string.max': 'Source context ID must not exceed 255 characters.',
    }),
  recommendation_text: Joi.string()
    .trim()
    .messages({
      'string.base': 'Recommendation text must be a string.',
      'string.empty': 'Recommendation text cannot be empty.',
    }),
};

export const createRecommendationSchema = Joi.object({
  source_system: recommendationBaseSchema.source_system.required().messages({
    'any.required': 'Source system is a required field.',
  }),
  source_context_id: recommendationBaseSchema.source_context_id,
  recommendation_text: recommendationBaseSchema.recommendation_text.required().messages({
    'any.required': 'Recommendation text is a required field.',
  }),
});

export const updateRecommendationSchema = Joi.object({
  source_system: recommendationBaseSchema.source_system,
  source_context_id: recommendationBaseSchema.source_context_id,
  recommendation_text: recommendationBaseSchema.recommendation_text,
}).min(1).messages({
  'object.min': 'At least one field must be provided for the update.',
});

export const recommendationIdParamSchema = Joi.object({
  recommendation_id: Joi.string().uuid({ version: 'uuidv4' }).required().messages({
    'string.base': 'Recommendation ID must be a string.',
    'string.guid': 'Recommendation ID must be a valid UUIDv4.',
    'any.required': 'Recommendation ID is required in URL parameters.',
  }),
});
