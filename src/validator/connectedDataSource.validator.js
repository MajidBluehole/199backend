const Joi = require('joi');

const connectionStatusEnum = ['PENDING', 'CONNECTED', 'ERROR', 'SYNCING'];

// Custom validator for syncSchedule to allow specific ENUMs or a cron-like string
const syncScheduleValidator = Joi.string().trim().max(50).custom((value, helpers) => {
  const upperValue = value.toUpperCase();
  if (['HOURLY', 'DAILY'].includes(upperValue)) {
    return upperValue;
  }
  // A simple check for cron strings. For production, use a dedicated library like 'cron-parser'.
  if (value.includes(' ') && value.split(' ').length >= 5) {
      return value;
  }
  return helpers.message('syncSchedule must be one of [HOURLY, DAILY] or a valid cron string.');
}, 'Custom Sync Schedule Validation');


const createConnectedDataSourceSchema = Joi.object({
  organizationId: Joi.string().uuid({ version: 'uuidv4' }).required(),
  sourceType: Joi.string().trim().max(50).required(),
  displayName: Joi.string().trim().max(255).required(),
  credentials: Joi.object().required().description('Encrypted storage for API keys, OAuth tokens, etc.'),
  syncSchedule: syncScheduleValidator.optional().default('DAILY'),
  // createdByUserId would typically be extracted from an authenticated user session (e.g., req.user.id)
  createdByUserId: Joi.string().uuid({ version: 'uuidv4' }).required()
});

const updateConnectedDataSourceSchema = Joi.object({
  displayName: Joi.string().trim().max(255).optional(),
  connectionStatus: Joi.string().valid(...connectionStatusEnum).optional(),
  credentials: Joi.object().optional(),
  syncSchedule: syncScheduleValidator.optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for the update.'
});

module.exports = {
  createConnectedDataSourceSchema,
  updateConnectedDataSourceSchema
};
