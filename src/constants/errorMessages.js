/**
 * Standardized Error Messages
 */
module.exports = {
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password.',
    UNAUTHORIZED: 'Authentication required. Please log in.',
    TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
    INVALID_TOKEN: 'Invalid authentication token.',
    FORBIDDEN: 'You do not have permission to access this resource.',
    EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
    MOBILE_ALREADY_EXISTS: 'An account with this mobile number already exists.',
    USER_NOT_FOUND: 'User account not found.'
  },
  OTP: {
    INVALID_OTP: 'Invalid OTP. Please check and try again.',
    EXPIRED_OTP: 'OTP has expired. Please request a new one.',
    MAX_ATTEMPTS_EXCEEDED: 'Maximum verification attempts exceeded. Please request a new OTP.',
    TEMPORARY_LOCK: 'Too many incorrect attempts. Please try again after 5 minutes.',
    RESEND_COOLDOWN: 'Please wait before requesting another OTP.',
    MAX_RESENDS_EXCEEDED: 'Maximum OTP resend limit reached. Please restart registration.',
    VERIFICATION_NOT_FOUND: 'Verification session not found or expired. Please register again.'
  },
  VALIDATION: {
    INVALID_EMAIL: 'Please provide a valid email address.',
    INVALID_MOBILE: 'Please provide a valid 10-digit mobile number or international phone format.',
    INVALID_PASSWORD: 'Password must be at least 6 characters and contain at least one uppercase letter, one lowercase letter, and one number.',
    INVALID_FULL_NAME: 'Full name is required and cannot be empty.'
  },
  SERVER: {
    INTERNAL_ERROR: 'An unexpected internal error occurred. Please try again later.'
  }
};
