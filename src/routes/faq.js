const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../middleware/auth');
const faqController = require('../controllers/faq/faqController');


router.use(authenticate);
router.use(authorizeRoles('admin')); 

// Category Routes
router.get('/categories', faqController.getCategories);
router.post('/categories', faqController.createCategory);
router.put('/categories/:id', faqController.updateCategory);
router.delete('/categories/:id', faqController.deleteCategory);

// FAQ Routes
router.post('/faqs', faqController.createFAQ);
router.get('/faqs', faqController.getFAQs);
router.put('/faqs/:id', faqController.updateFAQ);
router.delete('/faqs/:id', faqController.deleteFAQ);


module.exports = router;
