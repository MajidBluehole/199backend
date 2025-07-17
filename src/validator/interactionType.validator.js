const Joi = require('joi');

// Base schema for all fields
const baseSchema = {
    name: Joi.string()
        .trim()
        .min(2)
        .max(255)
        .pattern(/^[a-zA-Z0-9_-\s]+$/)
        .messages({
            'string.base': 'Name must be a string.',
            'string.empty': 'Name is required.',
            'string.min': 'Name must be at least 2 characters long.',
            'string.max': 'Name cannot exceed 255 characters.',
            'string.pattern.base': 'Name can only contain letters, numbers, spaces, underscores, and hyphens.'
        }),

    iconName: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .pattern(/^[a-zA-Z0-9_-]+$/)
        .messages({
            'string.base': 'Icon name must be a string.',
            'string.empty': 'Icon name is required.',
            'string.min': 'Icon name must be at least 2 characters long.',
            'string.max': 'Icon name cannot exceed 100 characters.',
            'string.pattern.base': 'Icon name can only contain letters, numbers, underscores, and hyphens.'
        }),

    isDeletable: Joi.boolean()
        .messages({
            'boolean.base': 'Is deletable must be a boolean (true or false).'
        }),

    displayOrder: Joi.number()
        .integer()
        .min(0)
        .messages({
            'number.base': 'Display order must be a number.',
            'number.integer': 'Display order must be an integer.',
            'number.min': 'Display order must be a non-negative number.'
        })
};

// Schema for creating a new interaction type
const createInteractionTypeSchema = Joi.object({
    name: baseSchema.name.required(),
    iconName: baseSchema.iconName.required(),
    isDeletable: baseSchema.isDeletable.default(true),
    displayOrder: baseSchema.displayOrder.required()
});

// Schema for updating an existing interaction type
const updateInteractionTypeSchema = Joi.object({
    name: baseSchema.name,
    iconName: baseSchema.iconName,
    isDeletable: baseSchema.isDeletable,
    displayOrder: baseSchema.displayOrder
}).min(1).messages({
    'object.min': 'At least one field must be provided for the update.'
});

// Schema for validating UUID in path parameters
const uuidParamSchema = Joi.object({
  id: Joi.string().uuid({
    version: ['uuidv4']
  }).required()
});

module.exports = {
    createInteractionTypeSchema,
    updateInteractionTypeSchema,
    uuidParamSchema
};