import Joi from 'joi';
import { fieldTypeEnum } from '../models/customField.model';

// Interface for type-checking the creation payload
export interface ICreateCustomField {
    name: string;
    label: string;
    fieldType: typeof fieldTypeEnum[number];
    isDeletable?: boolean;
    displayOrder: number;
}

// Interface for type-checking the update payload
export type IUpdateCustomField = Partial<ICreateCustomField>;

// Base schema for common fields to ensure consistency
const baseSchema = {
  name: Joi.string()
    .trim()
    .max(255)
    .pattern(/^[a-z0-9_]+$/)
    .messages({
      'string.pattern.base': '`name` must be in snake_case and contain only lowercase letters, numbers, and underscores.',
      'string.max': '`name` must not exceed 255 characters.',
    }),
  label: Joi.string().trim().max(255).messages({
    'string.max': '`label` must not exceed 255 characters.',
  }),
  fieldType: Joi.string().valid(...fieldTypeEnum),
  isDeletable: Joi.boolean(),
  displayOrder: Joi.number().integer().min(0).messages({
    'number.base': '`displayOrder` must be a number.',
    'number.integer': '`displayOrder` must be an integer.',
    'number.min': '`displayOrder` must be a non-negative number.',
  }),
};

// Schema for creating a new custom field
export const createCustomFieldSchema = Joi.object<ICreateCustomField>({
  name: baseSchema.name.required(),
  label: baseSchema.label.required(),
  fieldType: baseSchema.fieldType.required(),
  displayOrder: baseSchema.displayOrder.required(),
  isDeletable: baseSchema.isDeletable, // Optional on create, will use DB default if not provided
}).options({ abortEarly: false });

// Schema for updating an existing custom field
export const updateCustomFieldSchema = Joi.object<IUpdateCustomField>({
  ...baseSchema
}).min(1).messages({
  'object.min': 'At least one field must be provided for an update.',
}).options({ abortEarly: false });
