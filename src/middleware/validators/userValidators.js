const { body } = require('express-validator');

exports.registerValidation = [
  body('email')
    .isEmail()
    .withMessage('A valid email is required'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),

  body('firstName')
    // .optional()
    .isString()
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters'),

  body('phoneNumber')
    .optional({ checkFalsy: true })
    .isMobilePhone()
    .withMessage('Phone number must be valid')
    .isLength({ min: 10 })
    .withMessage('Phone number must be at least 10 digits'),

  body('lastName')
    // .optional()
    .isString()
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters'),
];

exports.mobileAppPasswordValidation = [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
];
exports.mobileregisterValidation = [
  body('email')
    .isEmail()
    .withMessage('A valid email is required'),

  body('firstName')
    // .optional()
    .isString()
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters'),

  body('phoneNumber')
  // .optional()
  .isMobilePhone()
  .isLength({ min: 10 })
  .withMessage('Phone number must 10 digits long'),

  body('lastName')
    // .optional()
    .isString()
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters'),
];

exports.mobileAppOtpValidation = [
    body('userId').notEmpty().withMessage('User ID is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
];

exports.forgotPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
];

exports.loginUserValidation = [
  body('email')
    .isEmail()
    .notEmpty()
    .withMessage('Email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

exports.resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 6 characters')
];

exports.profileValidation = [
  body('firstName')
    .isString()
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters'),

  body('lastName')
    .isString()
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters'),
    
  body('phoneNumber')
    .optional({ checkFalsy: true })
    .isMobilePhone()
    .withMessage('Phone number must be valid')
    .isLength({ min: 10 })
    .withMessage('Phone number must be at least 10 digits'),


];


exports.addUsersValidation = [
  body('firstName')
    .isString()
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters'),

  body('lastName')
    .isString()
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters'),
    
  body('phoneNumber')
    .optional({ checkFalsy: true })
    .isMobilePhone()
    .withMessage('Phone number must be valid')
    .isLength({ min: 10 })
    .withMessage('Phone number must be at least 10 digits'),

  body('role')
    .optional() // Uncomment if role is optional
    .isString()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either "user" or "admin"')
];