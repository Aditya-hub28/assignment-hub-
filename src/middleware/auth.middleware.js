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
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: errorMessages.AUTH.UNAUTHORIZED
        }
      });
    }

    // Support mock test tokens during automated test suite runs
    if (process.env.NODE_ENV === 'test' && token.startsWith('test-token-')) {
      const mockId = token.replace('test-token-', '');
      const isMockAdmin = mockId.includes('admin') || token.includes('admin');
      const mockRole = isMockAdmin ? 'admin' : 'student';
      req.user = {
        id: mockId,
        email: `${mockId}@example.com`,
        role: mockRole,
        user_metadata: { role: mockRole }
      };
      req.accessToken = token;
      req.profile = { id: mockId, email: `${mockId}@example.com`, role: mockRole };
      return next();
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
      if (profile && profile.role) {
        req.user.role = profile.role;
      } else {
        req.user.role = user.user_metadata?.role || 'student';
      }
    } catch (profileErr) {
      // If profile fetch fails, attach basic user payload
      const fallbackRole = user.user_metadata?.role || 'student';
      req.profile = {
        id: user.id,
        email: user.email,
        role: fallbackRole
      };
      req.user.role = fallbackRole;
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
