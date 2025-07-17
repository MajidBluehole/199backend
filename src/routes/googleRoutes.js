const express = require('express');
const router = express.Router();

const { googleLoginHandler } = require('../controllers/auth/googleLogin');

router.post('/google-login', googleLoginHandler);

module.exports = router;
