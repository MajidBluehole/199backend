const Joi = require('joi');

const baseSchema = {
    organization_id: Joi.string().uuid({
        version: ['uuidv4']
    }),
    name: Joi.string().max(255).allow(null, ''),
    email: Joi.string().email().max(255).allow(null, ''),
    company: Joi.string().max(255).allow(null, ''),
    merged_data: Joi.object()
};

const createMasterCustomerSchema = Joi.object({
    ...baseSchema,
    organization_id: baseSchema.organization_id.required(),
    merged_data: baseSchema.merged_data.required()
});

const updateMasterCustomerSchema = Joi.object({
    ...baseSchema
}).min(1).messages({
    'object.min': 'At least one field must be provided for the update.'
});

module.exports = {
    createMasterCustomerSchema,
    updateMasterCustomerSchema
};
