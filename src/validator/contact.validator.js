const Joi = require('joi');

// Base schema with all possible fields and their rules
const contactSchemaRules = {
  workspace_id: Joi.string().uuid({
    version: 'uuidv4',
    message: 'workspace_id must be a valid UUID v4',
  }),
  userId: Joi.string().uuid({
    version: 'uuidv4'
  }).messages({
    'string.guid': 'User ID must be a valid UUID'
  }),
  fullName: Joi.string().min(2).max(255),
  email: Joi.string().email({
    tlds: {
      allow: false
    }
  }).max(255).allow(null, ''),
  companyName: Joi.string().max(255).allow(null, ''),
  title: Joi.string().max(255).allow(null, ''),
  sourceSystem: Joi.string().max(50).allow(null, ''),
  sourceRecordId: Joi.string().max(255).allow(null, ''),
  lastContactDate: Joi.date().iso().allow(null),
};

// Schema for creating a new contact (POST request)
// Most fields are required.
const createContactSchema = Joi.object({
  ...contactSchemaRules,
  workspace_id: contactSchemaRules.workspace_id.required(),
  userId: contactSchemaRules.userId.required(),
  fullName: contactSchemaRules.fullName.required(),
});

// Schema for updating an existing contact (PUT/PATCH request)
// All fields are optional, as a client might only update one field.
// Key identifiers like workspace_id and userId should not be updatable via this endpoint.
const updateContactSchema = Joi.object({
  fullName: contactSchemaRules.fullName,
  email: contactSchemaRules.email,
  companyName: contactSchemaRules.companyName,
  title: contactSchemaRules.title,
  sourceSystem: contactSchemaRules.sourceSystem,
  sourceRecordId: contactSchemaRules.sourceRecordId,
  lastContactDate: contactSchemaRules.lastContactDate,
}).min(1); // Require at least one field to be updated

module.exports = {
  contactSchemaRules,
  createContactSchema,
  updateContactSchema,
};