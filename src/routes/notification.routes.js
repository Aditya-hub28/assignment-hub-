const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { supabaseAdmin, createScopedClient } = require('../config/supabase');
const profileService = require('../services/profile.service');

/**
 * Optional Authentication middleware: attaches user if token exists
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

// GET /api/v1/notifications
router.get('/', optionalAuth, notificationController.getNotifications);

// PUT /api/v1/notifications/mark-read
router.put('/mark-read', optionalAuth, notificationController.markRead);

module.exports = router;
