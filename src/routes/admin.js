const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../middleware/auth');
const { updateAdminProfile, changeAdminPassword } = require('../controllers/admin/profileManagement');
const { getAdminDashboard } = require('../controllers/admin/dashboard');
router.use(authenticate);            // Must be logged in
router.use(authorizeRoles('admin')); // Must be role "admin"
const adminUserController = require('../controllers/admin/userManagement');
const { addUsersValidation } = require('../middleware/validators/userValidators');

router.get('/dashboard', getAdminDashboard);
// Profile Management
router.put('/profile', updateAdminProfile);
router.put('/change-password', changeAdminPassword);
router.get('/profile', authenticate, adminUserController.getAdminProfile);


// User Management
router.get('/users', authenticate, adminUserController.getUsers);
router.post('/users',addUsersValidation, adminUserController.createUser);
router.put('/users/:id', adminUserController.updateUser);
router.delete('/users/:id', adminUserController.DeleteUser);

// Content Management
const {
  getStaticContentList,
  updateStaticContent,
  getStaticContentByType
} = require('../controllers/admin/contentManagement');

router.get('/static-content', getStaticContentList);
router.put('/static-content-update/:id', updateStaticContent);
router.get('/static-content/:type', getStaticContentByType);

// Contact Management
const {
  getContactMessages,
  deleteContactMessage,
  deleteMultipleMessages
} = require('../controllers/admin/contactUsManagement');
router.get('/contact-messages', getContactMessages);
router.delete('/contact-messages/:id', deleteContactMessage);
router.delete('/contact-messages', deleteMultipleMessages);

// Subscriber Management
const {
  getSubscribers,
  deleteSubscriber,
  deleteMultipleSubscribers
} = require('../controllers/admin/subscriberManagement');
router.get('/subscribers', getSubscribers);
router.delete('/subscribers/:id', deleteSubscriber);
router.delete('/subscribers', deleteMultipleSubscribers);

// CrashReport Management
const {
  getCrashReports,
  deleteCrashReport,
  deleteMultipleCrashReports
} = require('../controllers/admin/crashReportManagement');
router.get('/crash-reports', getCrashReports);
router.delete('/crash-reports/:id', deleteCrashReport);
router.delete('/crash-reports', deleteMultipleCrashReports);

module.exports = router;
