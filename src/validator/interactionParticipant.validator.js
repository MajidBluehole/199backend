const Joi = require('joi');

// Validation schema for creating a new interaction participant link.
// Since this is a join table, an 'update' operation is typically a delete followed by a create,
// so a separate update schema is not necessary.
const interactionParticipantSchema = Joi.object({
  interaction_id: Joi.string().uuid({
    version: ['uuidv4']
  }).required().messages({
    'string.base': 'Interaction ID must be a string.',
    'string.empty': 'Interaction ID is required.',
    'string.guid': 'Interaction ID must be a valid UUID.',
    'any.required': 'Interaction ID is required.'
  }),
  contact_id: Joi.string().uuid({
    version: ['uuidv4']
  }).required().messages({
    'string.base': 'Contact ID must be a string.',
    'string.empty': 'Contact ID is required.',
    'string.guid': 'Contact ID must be a valid UUID.',
    'any.required': 'Contact ID is required.'
  })
});

// Middleware for validation
const validateInteractionParticipant = (req, res, next) => {
  const { error } = interactionParticipantSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: 'Validation Error', 
      details: error.details.map(d => d.message) 
    });
  }
  next();
};

module.exports = {
  interactionParticipantSchema,
  validateInteractionParticipant
};