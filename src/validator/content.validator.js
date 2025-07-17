const Joi = require('joi');

const contentTypes = ['ARTICLE', 'UPDATE', 'TEMPLATE'];
const statuses = ['DRAFT', 'PUBLISHED', 'ARCHIVED', 'PENDING_REVIEW'];

const uuidValidator = Joi.string().guid({ version: 'uuidv4' });

// Base schema with all possible fields and their basic validation
const baseSchema = {
    title: Joi.string().min(3).max(255),
    body: Joi.string().min(10),
    content_type: Joi.string().valid(...contentTypes),
    status: Joi.string().valid(...statuses),
    author_id: uuidValidator,
    category_id: uuidValidator,
    submitted_by_id: uuidValidator.allow(null),
    template_variables: Joi.object().allow(null),
    version: Joi.number().integer().min(1),
    published_at: Joi.date().iso().allow(null)
};

// Schema for creating a new content item
// Most fields are required
const createContentSchema = Joi.object({
    ...baseSchema,
    title: baseSchema.title.required(),
    body: baseSchema.body.required(),
    content_type: baseSchema.content_type.required(),
    author_id: baseSchema.author_id.required(),
    category_id: baseSchema.category_id.required()
});

// Schema for updating an existing content item
// All fields are optional, as it's a PATCH/PUT operation
const updateContentSchema = Joi.object({
    ...baseSchema,
    // Fields that are typically locked or system-managed can be excluded
    author_id: undefined // Usually author should not be changed
}).min(1); // Require at least one field to be updated

module.exports = {
    createContentSchema,
    updateContentSchema
};