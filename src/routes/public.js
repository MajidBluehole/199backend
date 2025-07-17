const express = require('express');
const router = express.Router();
const { getStaticContentByType } = require('../controllers/public/staticContentController');
const { submitContactMessage } = require('../controllers/public/contactController');
const { getCountriesList } = require('../controllers/public/countryController');

// For contact form
router.post('/contact/message', submitContactMessage);

// For static content
router.get('/static/:type', getStaticContentByType);

// For static content
router.get('/countries-list', getCountriesList);

module.exports = router;
