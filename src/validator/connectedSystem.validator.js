const Joi = require('joi');

const SYSTEM_TYPES = ['SALESFORCE', 'HUBSPOT', 'GMAIL', 'OUTLOOK', 'ZENDESK', 'ZOOM', 'TEAMS'];
const STATUS_TYPES = ['CONNECTED', 'DISCONNECTED', 'ERROR', 'SYNCING'];

const createConnectedSystemSchema = Joi.object({
  workspace_id: Joi.string().uuid({ version: 'uuidv4' }).required()
    .messages({
      'string.base': 'Workspace ID must be a string.',
      'string.guid': 'Workspace ID must be a valid UUIDv4.',
      'any.required': 'Workspace ID is required.',
    }),
  system_type: Joi.string().valid(...SYSTEM_TYPES).required()
    .messages({
      'string.base': 'System type must be a string.',
      'any.only': `System type must be one of [${SYSTEM_TYPES.join(', ')}]`,
      'any.required': 'System type is required.',
    }),
  status: Joi.string().valid(...STATUS_TYPES).optional()
    .messages({
      'string.base': 'Status must be a string.',
      'any.only': `Status must be one of [${STATUS_TYPES.join(', ')}]`,
    }),
  last_synced_at: Joi.date().iso().optional().allow(null)
    .messages({
      'date.base': 'Last synced at must be a valid date.',
      'date.format': 'Last synced at must be in ISO 8601 format.',
    }),
});

const updateConnectedSystemSchema = Joi.object({
  // workspace_id and system_type are typically immutable for a connection.
  // Only status and sync time are allowed to be updated.
  status: Joi.string().valid(...STATUS_TYPES).optional()
    .messages({
      'string.base': 'Status must be a string.',
      'any.only': `Status must be one of [${STATUS_TYPES.join(', ')}]`,
    }),
  last_synced_at: Joi.date().iso().optional().allow(null)
    .messages({
      'date.base': 'Last synced at must be a valid date.',
      'date.format': 'Last synced at must be in ISO 8601 format.',
    }),
}).min(1).messages({ // Ensure at least one field is provided for update
  'object.min': 'At least one field must be provided for the update.'
});

module.exports = {
  createConnectedSystemSchema,
  updateConnectedSystemSchema,
};
