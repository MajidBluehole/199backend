const Joi = require('joi');

// Base schema containing validation rules for each field
const baseSchema = {
    interactionId: Joi.string().uuid({ version: 'uuidv4' }).messages({
        'string.guid': 'Interaction ID must be a valid UUIDv4.',
    }),
    speakerIdentifier: Joi.string().max(255).allow(null, '').messages({
        'string.max': 'Speaker identifier must not exceed 255 characters.',
    }),
    startTimeSeconds: Joi.number().integer().min(0).messages({
        'number.base': 'Start time must be a number.',
        'number.integer': 'Start time must be an integer.',
        'number.min': 'Start time must be a non-negative number.',
    }),
    endTimeSeconds: Joi.number().integer().min(Joi.ref('startTimeSeconds')).messages({
        'number.base': 'End time must be a number.',
        'number.integer': 'End time must be an integer.',
        'number.min': 'End time must be greater than or equal to the start time.',
    }),
    text: Joi.string().min(1).messages({
        'string.empty': 'Text field cannot be empty.',
        'string.min': 'Text must contain at least 1 character.',
    }),
    isEdited: Joi.boolean().messages({
        'boolean.base': 'Is edited must be a boolean value (true or false).',
    }),
};

// Validation schema for creating a new transcript segment (e.g., for a POST request)
const createTranscriptSchema = Joi.object({
    interactionId: baseSchema.interactionId.required(),
    speakerIdentifier: baseSchema.speakerIdentifier.optional(),
    startTimeSeconds: baseSchema.startTimeSeconds.required(),
    endTimeSeconds: baseSchema.endTimeSeconds.required(),
    text: baseSchema.text.required(),
    isEdited: baseSchema.isEdited.optional(), // Default is false, so not required on create
}).options({ abortEarly: false, stripUnknown: true });


// Validation schema for updating an existing transcript segment (e.g., for PUT or PATCH requests)
const updateTranscriptSchema = Joi.object({
    speakerIdentifier: baseSchema.speakerIdentifier,
    startTimeSeconds: baseSchema.startTimeSeconds,
    endTimeSeconds: baseSchema.endTimeSeconds,
    text: baseSchema.text,
    isEdited: baseSchema.isEdited,
}).min(1).messages({ // Ensures at least one field is provided for an update
    'object.min': 'At least one field must be provided for an update.',
}).options({ abortEarly: false, stripUnknown: true });


module.exports = {
    createTranscriptSchema,
    updateTranscriptSchema,
};
