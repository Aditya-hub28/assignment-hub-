const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validate } = require('../middleware/validation.middleware');
const { requireAuth } = require('../middleware/auth.middleware');
const { authLimiter, otpRequestLimiter } = require('../middleware/rateLimiter.middleware');
const {
  registerInitiateSchema,
  registerVerifyOtpSchema,
  resendOtpSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} = require('../validators/auth.validator');

// Step 1: Initiate Registration & send mobile OTP
router.post(
  '/register/initiate',
  otpRequestLimiter,
  validate(registerInitiateSchema),
  authController.initiateRegistration
);

// Step 2: Verify Mobile OTP & finalize account creation
router.post(
  '/register/verify-otp',
  authLimiter,
  validate(registerVerifyOtpSchema),
  authController.verifyRegistrationOtp
);

// Step 3: Resend Mobile OTP
router.post(
  '/register/resend-otp',
  otpRequestLimiter,
  validate(resendOtpSchema),
  authController.resendRegistrationOtp
);

// Standard Login (Email + Password only)
router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  authController.login
);

// Forgot Password (Email reset link)
router.post(
  ['/forgot-password', '/password/forgot'],
  authLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword
);

// Reset Password (OTP code or Authenticated recovery link)
router.post(
  ['/reset-password', '/password/reset'],
  authLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword
);

// Logout (Authenticated)
router.post(
  '/logout',
  requireAuth,
  authController.logout
);

module.exports = router;
