const { supabaseAdmin, createScopedClient } = require('../config/supabase');
const profileService = require('../services/profile.service');
const errorMessages = require('../constants/errorMessages');

/**
 * Authentication Middleware
 * Validates Supabase JWT access token and attaches user & profile to request
 */
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: errorMessages.AUTH.UNAUTHORIZED
        }
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: errorMessages.AUTH.INVALID_TOKEN
        }
      });
    }

    // Verify token with Supabase Auth
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: errorMessages.AUTH.TOKEN_EXPIRED
        }
      });
    }

    // Attach user, token and scoped client to request
    req.user = user;
    req.accessToken = token;
    req.scopedClient = createScopedClient(token);

    // Fetch user's profile and role
    try {
      const profile = await profileService.getProfile(user.id, req.scopedClient);
      req.profile = profile;
    } catch (profileErr) {
      // If profile fetch fails, attach basic user payload
      req.profile = {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role || 'student'
      };
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: errorMessages.AUTH.UNAUTHORIZED
      }
    });
  }
};

module.exports = { requireAuth };
