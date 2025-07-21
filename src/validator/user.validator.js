const Joi = require('joi');

const roles = ['Admin', 'User', 'ReadOnly'];

// Base schema for user properties
const userBaseSchema = {
  email: Joi.string().email().max(255).trim(),
  fullName: Joi.string().min(2).max(255).trim(),
  firstName: Joi.string().min(1).max(255).trim(),
  lastName: Joi.string().min(1).max(255).trim(),
  workspace_id: Joi.string().guid({ version: 'uuidv4' }),
  role: Joi.string().valid(...roles),
};

// Schema for creating a new user
// Password is required and has complexity rules
const createUserSchema = Joi.object({
  ...userBaseSchema,
  email: userBaseSchema.email.required(),
  firstName: userBaseSchema.firstName.required(),
  lastName: userBaseSchema.lastName.required(),
  // In a real app, fullName would be constructed from firstName and lastName
  fullName: userBaseSchema.fullName.required(),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
    .message('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.')
    .required(),
  role: userBaseSchema.role.default('User'),
});

// Schema for updating an existing user
// All fields are optional, and password has the same complexity rules if provided
const updateUserSchema = Joi.object({
  ...userBaseSchema,
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
    .message('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'),
}).min(1); // Require at least one field to be updated

module.exports = {
  userBaseSchema,
  createUserSchema,
  updateUserSchema,
};
