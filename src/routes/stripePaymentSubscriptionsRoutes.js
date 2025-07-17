const express = require('express');
const router = express.Router();
const { createProduct, UserSubscriptionList, AdminSubscriptionHistory, AdminSubscriptionList, FailedSubscribe, SuccessSubscribe, Subscribe, ActiveSubscriptionList, updateProduct, getProduct, listProducts, deactivateProduct, searchProducts  } = require('../controllers/payment/stripe/subscriptionController');


// Create a new product
router.post('/create-product', createProduct);
// Update a product by ID
router.put('/update-product/:id', updateProduct);
// Get a single product by ID
router.get('/get-product/:id', getProduct);
// List all products
router.get('/list-products', listProducts);
// Delete a product by ID
router.delete('/delete-product/:id', deactivateProduct);
// Search for products
router.get('/search-products', searchProducts);

// List all active products
router.get('/active-subscription-list', ActiveSubscriptionList);

// buy subscription route
router.get('/subscribe', Subscribe);

// success redirect url
router.get('/success-subscription', SuccessSubscribe);

// fail redirect url
router.get('/cancel-subscription', FailedSubscribe);

router.get('/user-subscription-list', UserSubscriptionList);
router.get('/admin-subscription-list', AdminSubscriptionList);
router.get('/admin-subscription-history', AdminSubscriptionHistory);


module.exports = router;