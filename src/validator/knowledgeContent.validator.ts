import Joi from 'joi';

const contentTypes = ['Sales Sheet', 'Technical Doc', 'Case Study', 'Presentation', 'Other'];
const uploadStatuses = ['Uploading', 'Processing', 'Completed', 'Failed'];

const baseSchema = {
    uploader_id: Joi.string().uuid({ version: 'uuidv4' }).messages({
        'string.guid': 'Uploader ID must be a valid UUIDv4'
    }),
    title: Joi.string().trim().min(3).max(255),
    description: Joi.string().trim().allow(null, ''),
    content_type: Joi.string().valid(...contentTypes),
    file_name: Joi.string().trim().max(255),
    file_path: Joi.string().trim().max(1024),
    file_size: Joi.number().integer().positive().allow(0),
    file_mime_type: Joi.string().trim().max(127),
    upload_status: Joi.string().valid(...uploadStatuses)
};

// Validation schema for creating a new knowledge content record.
export const createKnowledgeContentSchema = Joi.object({
    uploader_id: baseSchema.uploader_id.required(),
    title: baseSchema.title.required(),
    description: baseSchema.description.optional(),
    content_type: baseSchema.content_type.required(),
    file_name: baseSchema.file_name.required(),
    file_path: baseSchema.file_path.required(),
    file_size: baseSchema.file_size.required(),
    file_mime_type: baseSchema.file_mime_type.required(),
    upload_status: baseSchema.upload_status.optional() // Optional as it has a default value
}).options({ abortEarly: false, stripUnknown: true });

// Validation schema for updating an existing knowledge content record.
// Only allows updating fields that a user should typically be able to change.
export const updateKnowledgeContentSchema = Joi.object({
    title: baseSchema.title.optional(),
    description: baseSchema.description.optional(),
    content_type: baseSchema.content_type.optional(),
    // upload_status is typically managed by the system, not direct user input
    upload_status: baseSchema.upload_status.optional()
}).min(1).messages({ // Ensures that the request body is not empty
    'object.min': 'At least one field must be provided for the update.'
}).options({ abortEarly: false, stripUnknown: true });
