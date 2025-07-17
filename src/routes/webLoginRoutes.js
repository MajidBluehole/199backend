const express = require('express');
const router = express.Router();
const { registerValidation, forgotPasswordValidation, resetPasswordValidation} = require('../middleware/validators/userValidators');
const { handleValidation } = require('../middleware/handleValidation');

const { registerUser, resendVerificationEmail, verifyRegisterOtp } = require('../controllers/auth/register');
const { verifyRegisterEmail, verifyPasswordResetEmail } = require('../controllers/auth/verifyEmail');
const { forgotPassword, resetPassword } = require('../controllers/auth/forgotPassword');

router.post('/register', registerValidation, registerUser);
router.post('/resend-verification-email', resendVerificationEmail);
router.get('/verify-register-email', verifyRegisterEmail);

router.post('/verify-otp', verifyRegisterOtp);

router.post('/forgot-password', forgotPasswordValidation, handleValidation, forgotPassword);
router.get('/verify-password-reset-email', verifyPasswordResetEmail);
router.post('/reset-password', resetPasswordValidation, handleValidation, resetPassword);

module.exports = router;