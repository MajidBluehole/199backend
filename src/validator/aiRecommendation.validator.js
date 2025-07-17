const Joi = require('joi');

const recommendationTypes = [
  'CREATE_SF_OPPORTUNITY',
  'CREATE_ZENDESK_TICKET',
  'SCHEDULE_FOLLOW_UP',
  'DRAFT_EMAIL',
  'CREATE_SF_TASK'
];

const recommendationStatuses = [
  'PENDING',
  'ACTION_TAKEN',
  'DISMISSED'
];

// Schema for creating a new recommendation
const createRecommendationSchema = Joi.object({
  interactionId: Joi.string().uuid({ version: 'uuidv4' }).required().messages({
    'string.base': 'Interaction ID must be a string',
    'string.guid': 'Interaction ID must be a valid UUIDv4',
    'any.required': 'Interaction ID is required',
  }),
  type: Joi.string().valid(...recommendationTypes).required().messages({
    'any.only': `Type must be one of [${recommendationTypes.join(', ')}]`,
    'any.required': 'Type is required',
  }),
  details: Joi.object().optional().allow(null),
  status: Joi.string().valid(...recommendationStatuses).optional().default('PENDING').messages({
    'any.only': `Status must be one of [${recommendationStatuses.join(', ')}]`,
  }),
});

// Schema for updating an existing recommendation
// All fields are optional for PATCH requests
const updateRecommendationSchema = Joi.object({
  type: Joi.string().valid(...recommendationTypes).optional().messages({
    'any.only': `Type must be one of [${recommendationTypes.join(', ')}]`,
  }),
  details: Joi.object().optional().allow(null),
  status: Joi.string().valid(...recommendationStatuses).optional().messages({
    'any.only': `Status must be one of [${recommendationStatuses.join(', ')}]`,
  }),
}).min(1).messages({ // Ensure at least one field is being updated
    'object.min': 'At least one field must be provided for the update.'
});

module.exports = {
  createRecommendationSchema,
  updateRecommendationSchema,
};