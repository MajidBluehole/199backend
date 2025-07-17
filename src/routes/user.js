const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../middleware/auth');
const { getUserDashboard } = require ('../controllers/user/dashboard');
const { getProfile, updateProfile, changePassword, deleteAccount } = require('../controllers/user/userController');
const { profileValidation } = require('../middleware/validators/userValidators');
const { handleValidation } = require('../middleware/handleValidation');
const { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } = require('../controllers/user/notificationController');
const { getUserTransactions } = require('../controllers/user/transactionController');


router.use(authenticate);           // Must be logged in
router.use(authorizeRoles('user')); // Must be role "user"

router.get('/dashboard', authenticate, getUserDashboard);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, profileValidation, handleValidation, updateProfile);
router.put('/change-password', authenticate, changePassword);

router.get('/notifications', authenticate, getUserNotifications);
router.put('/notifications/:id/read', authenticate, markNotificationAsRead);
router.put('/notifications/read-all', authenticate, markAllNotificationsAsRead);

router.delete('/account', authenticate, deleteAccount);

router.get('/transactions', authenticate, getUserTransactions);


module.exports = router;
