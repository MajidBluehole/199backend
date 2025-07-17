const Joi = require('joi');

const sourceSystemEnum = ['SALESFORCE', 'HUBSPOT', 'ZENDESK', 'GMAIL'];

// Base schema containing rules common to both create and update operations
const baseSchema = {
  organization_id: Joi.string().uuid({ version: 'uuidv4' })
    .messages({ 'string.guid': 'organization_id must be a valid UUID' }),
  contact_identifier: Joi.string().max(255).allow(null, ''),
  source_system: Joi.string().valid(...sourceSystemEnum),
  event_type: Joi.string().max(100).allow(null, ''),
  event_time: Joi.date().iso()
    .messages({ 'date.format': 'event_time must be in ISO 8601 date format' }),
  title: Joi.string().max(255),
  description: Joi.string().allow(null, ''),
  external_url: Joi.string().uri().max(2048).allow(null, '')
    .messages({ 'string.uri': 'external_url must be a valid URI' }),
};

// Schema for creating a new timeline event. Required fields are explicitly marked.
const createTimelineEventSchema = Joi.object({
  ...baseSchema,
  organization_id: baseSchema.organization_id.required(),
  source_system: baseSchema.source_system.required(),
  event_time: baseSchema.event_time.required(),
  title: baseSchema.title.required(),
});

// Schema for updating an existing timeline event. All fields are optional.
const updateTimelineEventSchema = Joi.object(baseSchema).min(1)
  .messages({ 'object.min': 'At least one field must be provided for update' });

module.exports = {
  createTimelineEventSchema,
  updateTimelineEventSchema,
};