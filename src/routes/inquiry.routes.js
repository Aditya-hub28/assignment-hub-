const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiry.controller');
const { supabaseAdmin, createScopedClient } = require('../config/supabase');
const profileService = require('../services/profile.service');

/**
 * Optional Authentication middleware: attaches user if valid token exists, otherwise proceeds as guest
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) return next();

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (!error && user) {
      req.user = user;
      req.accessToken = token;
      req.scopedClient = createScopedClient(token);
      try {
        req.profile = await profileService.getProfile(user.id, req.scopedClient);
      } catch {
        req.profile = { id: user.id, email: user.email };
      }
    }
  } catch {
    // Proceed gracefully
  }
  next();
};

// GET /api/v1/inquiries - List inquiries for user
router.get('/', optionalAuth, inquiryController.getInquiries);

// GET /api/v1/inquiries/:id - Get specific inquiry with chat thread
router.get('/:id', optionalAuth, inquiryController.getInquiryById);

// POST /api/v1/inquiries/:id/messages - Send message to inquiry
router.post('/:id/messages', optionalAuth, inquiryController.sendMessage);

module.exports = router;
