const express = require('express');
const router = express.Router();
const serviceRequestController = require('../controllers/serviceRequest.controller');
const { validate } = require('../middleware/validation.middleware');
const { requireAuth } = require('../middleware/auth.middleware');
const { createServiceRequestSchema } = require('../validators/serviceRequest.validator');
const { supabaseAdmin, createScopedClient } = require('../config/supabase');
const profileService = require('../services/profile.service');

/**
 * Optional Authentication middleware: attaches user if valid token exists, otherwise proceeds as guest
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) return next();

  if (process.env.NODE_ENV === 'test' && token.startsWith('test-token-')) {
    const mockId = token.replace('test-token-', '');
    req.user = { id: mockId, email: `${mockId}@example.com`, user_metadata: { role: 'student' } };
    req.accessToken = token;
    req.profile = { id: mockId, email: `${mockId}@example.com`, role: 'student' };
    return next();
  }

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

// GET /api/v1/services/requests/:id/files/:filename - Authorized file download
router.get(
  '/requests/:id/files/:filename',
  requireAuth,
  serviceRequestController.downloadFile
);

module.exports = router;
