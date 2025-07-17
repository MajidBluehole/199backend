import Joi from 'joi';

const INTEGRATION_TYPES = [
  'SALESFORCE', 'HUBSPOT', 'ZENDESK', 'SERVICENOW',
  'GMAIL', 'OUTLOOK', 'ZOOM', 'TEAMS'
];

const INTEGRATION_STATUSES = ['CONNECTED', 'DISCONNECTED', 'ERROR'];

// Schema for creating a new integration
const createIntegration = Joi.object({
  organizationId: Joi.string().uuid({ version: 'uuidv4' }).required()
    .messages({
      'string.base': 'Organization ID must be a string.',
      'string.guid': 'Organization ID must be a valid UUID.',
      'any.required': 'Organization ID is required.'
    }),
  type: Joi.string().valid(...INTEGRATION_TYPES).required()
    .messages({
      'any.only': `Type must be one of [${INTEGRATION_TYPES.join(', ')}]`,
      'any.required': 'Type is required.'
    }),
  status: Joi.string().valid(...INTEGRATION_STATUSES).optional()
    .messages({
      'any.only': `Status must be one of [${INTEGRATION_STATUSES.join(', ')}]`
    }),
  credentials: Joi.string().optional().allow(null),
  lastSyncAt: Joi.date().iso().optional().allow(null)
    .messages({
      'date.format': 'Last sync date must be in ISO 8601 format.'
    })
});

// Schema for updating an existing integration
// Note: organizationId and type are typically immutable and not included in update schemas.
const updateIntegration = Joi.object({
  status: Joi.string().valid(...INTEGRATION_STATUSES).optional()
    .messages({
      'any.only': `Status must be one of [${INTEGRATION_STATUSES.join(', ')}]`
    }),
  credentials: Joi.string().optional().allow(null),
  lastSyncAt: Joi.date().iso().optional().allow(null)
    .messages({
      'date.format': 'Last sync date must be in ISO 8601 format.'
    })
}).min(1).messages({ // Ensures the request body is not empty
  'object.min': 'At least one field must be provided for update.'
});

export {
  createIntegration,
  updateIntegration
};
