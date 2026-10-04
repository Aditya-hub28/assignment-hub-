const express = require('express');
const router = express.Router();
const serviceRequestController = require('../controllers/serviceRequest.controller');
const { validate } = require('../middleware/validation.middleware');
const { createServiceRequestSchema } = require('../validators/serviceRequest.validator');
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

// POST /api/v1/services/requests - Create request
router.post(
  '/requests',
  optionalAuth,
  validate(createServiceRequestSchema),
  serviceRequestController.createRequest
);

// GET /api/v1/services/requests - Get requests
router.get(
  '/requests',
  optionalAuth,
  serviceRequestController.getRequests
);

// GET /api/v1/services/requests/:id - Get request by ID
router.get(
  '/requests/:id',
  optionalAuth,
  serviceRequestController.getRequestById
);

module.exports = router;
