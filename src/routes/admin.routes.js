const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validation.middleware');
const { ROLES } = require('../constants/roles');
const {
  updateRequestStatusSchema,
  sendInquiryMessageSchema,
  requestsQuerySchema,
  inquiriesQuerySchema,
  usersQuerySchema
} = require('../validators/admin.validator');

/**
 * All admin routes require valid authentication AND 'admin' role
 */
router.use(requireAuth);
router.use(requireRole(ROLES.ADMIN));

// 1. Dashboard statistics
router.get('/dashboard/stats', adminController.getDashboardStats);

// 2. Request management
router.get('/requests', validate(requestsQuerySchema, 'query'), adminController.getRequests);
router.get('/requests/:id', adminController.getRequestById);
router.patch('/requests/:id/status', validate(updateRequestStatusSchema, 'body'), adminController.updateRequestStatus);

// 3. Inquiries desk
router.get('/inquiries', validate(inquiriesQuerySchema, 'query'), adminController.getInquiries);
router.get('/inquiries/:id', adminController.getInquiryById);
router.post('/inquiries/:id/messages', validate(sendInquiryMessageSchema, 'body'), adminController.sendInquiryMessage);

// 4. Student roster
router.get('/users', validate(usersQuerySchema, 'query'), adminController.getUsers);
router.get('/users/:id', adminController.getUserById);

module.exports = router;
