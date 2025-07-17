import Joi from 'joi';

const serviceNameEnum = [
  'SALESFORCE',
  'HUBSPOT',
  'ZENDESK',
  'GMAIL',
  'OUTLOOK',
  'ZOOM',
  'TEAMS',
  'CALENDAR',
];

const statusEnum = ['CONNECTED', 'DISCONNECTED', 'ERROR'];

const createSchema = Joi.object({
  userId: Joi.string().uuid({ version: 'uuidv4' }).required().messages({
    'string.base': 'User ID must be a string.',
    'string.guid': 'User ID must be a valid UUIDv4.',
    'any.required': 'User ID is required.',
  }),
  serviceName: Joi.string().valid(...serviceNameEnum).required().messages({
    'any.only': `Service name must be one of [${serviceNameEnum.join(', ')}]`,
    'any.required': 'Service name is required.',
  }),
  accessTokenEncrypted: Joi.string().trim().required().messages({
    'string.base': 'Access token must be a string.',
    'string.empty': 'Access token cannot be empty.',
    'any.required': 'Access token is required.',
  }),
  refreshTokenEncrypted: Joi.string().trim().allow(null, '').optional(),
  status: Joi.string().valid(...statusEnum).optional().messages({
    'any.only': `Status must be one of [${statusEnum.join(', ')}]`,
  }),
  lastSyncAt: Joi.date().iso().allow(null).optional().messages({
    'date.format': 'Last sync timestamp must be in ISO 8601 format.',
  }),
});

const updateSchema = Joi.object({
  accessTokenEncrypted: Joi.string().trim().optional(),
  refreshTokenEncrypted: Joi.string().trim().allow(null, '').optional(),
  status: Joi.string().valid(...statusEnum).optional().messages({
    'any.only': `Status must be one of [${statusEnum.join(', ')}]`,
  }),
  lastSyncAt: Joi.date().iso().allow(null).optional().messages({
    'date.format': 'Last sync timestamp must be in ISO 8601 format.',
  }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for the update.',
});

export const userIntegrationValidator = {
  create: createSchema,
  update: updateSchema,
};
