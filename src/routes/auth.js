const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

const { loginUserValidation} = require('../middleware/validators/userValidators');

const { loginUser, logout } = require('../controllers/auth/login');
const { twitterLoginHandler, twitterCallbackHandler } = require('../controllers/auth/twitterLogin');

router.post('/login',loginUserValidation, loginUser);

router.post('/logout', authenticate, logout); // ensure user is logged in

router.get('/twitter', twitterLoginHandler);
router.get('/twitter/callback', twitterCallbackHandler);

module.exports = router;