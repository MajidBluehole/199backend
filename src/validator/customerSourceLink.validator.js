const Joi = require('joi');

const baseSchema = {
  masterCustomerId: Joi.string().uuid({ version: 'uuidv4' })
    .messages({
      'string.guid': 'masterCustomerId must be a valid UUIDv4 string.',
    }),
  connectedDataSourceId: Joi.string().uuid({ version: 'uuidv4' })
    .messages({
      'string.guid': 'connectedDataSourceId must be a valid UUIDv4 string.',
    }),
  sourceRecordId: Joi.string().max(255)
    .messages({
      'string.max': 'sourceRecordId must not exceed 255 characters.',
    }),
  lastSyncedAt: Joi.date().iso()
    .messages({
      'date.format': 'lastSyncedAt must be a valid ISO 8601 date string (e.g., YYYY-MM-DDTHH:mm:ss.sssZ).',
    }),
};

const createCustomerSourceLinkSchema = Joi.object({
  masterCustomerId: baseSchema.masterCustomerId.required(),
  connectedDataSourceId: baseSchema.connectedDataSourceId.required(),
  sourceRecordId: baseSchema.sourceRecordId.required(),
  lastSyncedAt: baseSchema.lastSyncedAt.required(),
}).messages({
  'any.required': '{{#label}} is a required field.',
});

const updateCustomerSourceLinkSchema = Joi.object({
  masterCustomerId: baseSchema.masterCustomerId,
  connectedDataSourceId: baseSchema.connectedDataSourceId,
  sourceRecordId: baseSchema.sourceRecordId,
  lastSyncedAt: baseSchema.lastSyncedAt,
}).min(1).messages({
  'object.min': 'At least one field must be provided for an update operation.',
});

module.exports = {
  createCustomerSourceLinkSchema,
  updateCustomerSourceLinkSchema,
};