const Joi = require('joi');

const SOURCE_TYPES = [
  'SALESFORCE',
  'HUBSPOT',
  'ZENDESK',
  'SERVICENOW',
  'GMAIL',
  'OUTLOOK',
  'ZOOM',
  'TEAMS',
];

const CONNECTION_STATUSES = ['CONNECTED', 'DISCONNECTED', 'ERROR'];

const baseSchema = {
  organizationId: Joi.string().uuid({
    version: 'uuidv4'
  }),
  sourceType: Joi.string().valid(...SOURCE_TYPES),
  displayName: Joi.string().min(1).max(255),
  connectionStatus: Joi.string().valid(...CONNECTION_STATUSES),
  credentials: Joi.object().allow(null),
  lastErrorMessage: Joi.string().allow(null, ''),
  lastSyncAt: Joi.date().iso().allow(null),
};

const createDataSourceSchema = Joi.object({
  ...baseSchema,
  organizationId: baseSchema.organizationId.required(),
  sourceType: baseSchema.sourceType.required(),
  displayName: baseSchema.displayName.required(),
  connectionStatus: baseSchema.connectionStatus.default('DISCONNECTED'),
});

const updateDataSourceSchema = Joi.object({
  ...baseSchema
}).min(1); // Require at least one field to be updated

module.exports = {
  createDataSourceSchema,
  updateDataSourceSchema,
};