const errorMessages = require('../constants/errorMessages');

/**
 * Role-based Authorization Middleware
 * Ensures user has at least one of the allowed roles
 * @param {string|string[]} roles
 */
const requireRole = (...allowedRoles) => {
  const roles = allowedRoles.flat();

  return (req, res, next) => {
    if (!req.user || !req.profile) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: errorMessages.AUTH.UNAUTHORIZED
        }
      });
    }

    const userRole = req.profile.role;

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: errorMessages.AUTH.FORBIDDEN
        }
      });
    }

    next();
  };
};

module.exports = { requireRole };
