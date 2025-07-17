const Joi = require('joi');

// Base schema for common fields
const baseSchema = {
  organizationId: Joi.string().uuid({
    version: 'uuidv4'
  }),
  modelKey: Joi.string().max(100),
  displayName: Joi.string().max(255),
  description: Joi.string().allow(null, ''),
  isEnabled: Joi.boolean(),
  configuration: Joi.object().allow(null),
};

// Schema for creating a new insight model, where most fields are required
const createInsightModelSchema = Joi.object({
  ...baseSchema,
  organizationId: baseSchema.organizationId.required(),
  modelKey: baseSchema.modelKey.required(),
  displayName: baseSchema.displayName.required(),
  isEnabled: baseSchema.isEnabled.default(false),
});

// Schema for updating an existing insight model, where all fields are optional
const updateInsightModelSchema = Joi.object(baseSchema).min(1); // Require at least one field to be updated

module.exports = {
  createInsightModelSchema,
  updateInsightModelSchema,
};
