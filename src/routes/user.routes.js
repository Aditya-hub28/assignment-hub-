const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { updateProfileSchema } = require('../validators/auth.validator');

// All user routes require authentication
router.use(requireAuth);

// Get current user profile and college association
router.get('/profile', userController.getProfile);

// Update allowed profile fields (full_name)
router.put('/profile', validate(updateProfileSchema), userController.updateProfile);

// Quick identity check
router.get('/me', userController.getMe);

module.exports = router;
