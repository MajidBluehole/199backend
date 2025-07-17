const Joi = require('joi');

const statusOptions = ['PENDING', 'ANALYZING', 'ACTIVE', 'COMPLETED', 'CANCELLED'];
const sourceServiceOptions = ['SALESFORCE', 'HUBSPOT', 'ZENDESK', 'GMAIL', 'OUTLOOK', 'ZOOM', 'TEAMS', 'CALENDAR', 'RELAIVAINT_APP'];
const interactionTypeOptions = ['CALL', 'EMAIL', 'MEETING', 'TICKET', 'NOTE'];

const createInteractionSchema = Joi.object({
  user_id: Joi.string().uuid().required().messages({
    'string.base': 'User ID must be a string',
    'string.guid': 'User ID must be a valid UUID',
    'any.required': 'User ID is required'
  }),
  workspace_id: Joi.string().uuid().required().messages({
    'string.base': 'Workspace ID must be a string',
    'string.guid': 'Workspace ID must be a valid UUID',
    'any.required': 'Workspace ID is required'
  }),
  contact_id: Joi.string().uuid().allow(null).messages({
    'string.guid': 'Contact ID must be a valid UUID'
  }),
  objective: Joi.string().required().messages({
    'string.base': 'Objective must be a string',
    'any.required': 'Objective is required'
  }),
  status: Joi.string().valid(...statusOptions).default('PENDING'),
  external_id: Joi.string().max(255).allow(null, '').messages({
    'string.max': 'External ID cannot exceed 255 characters'
  }),
  source_service: Joi.string().valid(...sourceServiceOptions).required().messages({
    'any.only': `Source service must be one of [${sourceServiceOptions.join(', ')}]`,
    'any.required': 'Source service is required'
  }),
  interaction_type: Joi.string().valid(...interactionTypeOptions).required().messages({
    'any.only': `Interaction type must be one of [${interactionTypeOptions.join(', ')}]`,
    'any.required': 'Interaction type is required'
  }),
  subject: Joi.string().required().messages({
    'string.base': 'Subject must be a string',
    'any.required': 'Subject is required'
  }),
  summary: Joi.string().allow(null, ''),
  start_time: Joi.date().iso().required().messages({
    'date.format': 'Start time must be a valid ISO 8601 date',
    'any.required': 'Start time is required'
  }),
  started_at: Joi.date().iso().allow(null).messages({
    'date.format': 'Started at must be a valid ISO 8601 date'
  })
});

const updateInteractionSchema = Joi.object({
  objective: Joi.string(),
  status: Joi.string().valid(...statusOptions),
  contact_id: Joi.string().uuid().allow(null),
  external_id: Joi.string().max(255).allow(null, ''),
  source_service: Joi.string().valid(...sourceServiceOptions),
  interaction_type: Joi.string().valid(...interactionTypeOptions),
  subject: Joi.string(),
  summary: Joi.string().allow(null, ''),
  start_time: Joi.date().iso(),
  started_at: Joi.date().iso().allow(null)
}).min(1).messages({
  'object.min': 'At least one field must be provided for an update.'
});

module.exports = {
  createInteractionSchema,
  updateInteractionSchema
};
