const Joi = require('joi');
const errorMessages = require('../constants/errorMessages');

// Password regex pattern: min 6 chars, >=1 uppercase, >=1 lowercase, >=1 digit
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

// Mobile regex pattern: allows 10-digit numbers or international E.164 formats (+91...)
const mobileRegex = /^(\+?\d{1,4}[-.\s]?)?[6-9]\d{9}$/;

// Registration Initiate Schema
const registerInitiateSchema = Joi.object({
  full_name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': errorMessages.VALIDATION.INVALID_FULL_NAME,
      'any.required': errorMessages.VALIDATION.INVALID_FULL_NAME
    }),

  email: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': errorMessages.VALIDATION.INVALID_EMAIL,
      'string.empty': errorMessages.VALIDATION.INVALID_EMAIL,
      'any.required': errorMessages.VALIDATION.INVALID_EMAIL
    }),

  mobile: Joi.string()
    .trim()
    .pattern(mobileRegex)
    .required()
    .messages({
      'string.pattern.base': errorMessages.VALIDATION.INVALID_MOBILE,
      'string.empty': errorMessages.VALIDATION.INVALID_MOBILE,
      'any.required': errorMessages.VALIDATION.INVALID_MOBILE
    }),

  password: Joi.string()
    .min(6)
    .pattern(passwordRegex)
    .required()
    .messages({
      'string.pattern.base': errorMessages.VALIDATION.INVALID_PASSWORD,
      'string.min': errorMessages.VALIDATION.INVALID_PASSWORD,
      'string.empty': errorMessages.VALIDATION.INVALID_PASSWORD,
      'any.required': errorMessages.VALIDATION.INVALID_PASSWORD
    })
});

// Registration OTP Verify Schema
const registerVerifyOtpSchema = Joi.object({
  verification_id: Joi.string()
    .guid({ version: ['uuidv4'] })
    .required()
    .messages({
      'string.guid': 'Invalid verification ID format.',
      'any.required': 'Verification ID is required.'
    }),

  otp: Joi.string()
    .length(6)
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      'string.length': 'OTP must be exactly 6 digits.',
      'string.pattern.base': 'OTP must contain only numbers.',
      'any.required': 'OTP is required.'
    })
});

// Resend OTP Schema
const resendOtpSchema = Joi.object({
  verification_id: Joi.string()
    .guid({ version: ['uuidv4'] })
    .required()
    .messages({
      'string.guid': 'Invalid verification ID format.',
      'any.required': 'Verification ID is required.'
    })
});

// Login Schema
const loginSchema = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': errorMessages.VALIDATION.INVALID_EMAIL,
      'any.required': 'Email is required.'
    }),

  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required.'
    })
});

// Forgot Password Schema
const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': errorMessages.VALIDATION.INVALID_EMAIL,
      'any.required': 'Email is required.'
    }),

  redirect_to: Joi.string()
    .uri()
    .optional()
});

// Reset Password Schema
const resetPasswordSchema = Joi.object({
  password: Joi.string()
    .min(6)
    .pattern(passwordRegex)
    .required()
    .messages({
      'string.pattern.base': errorMessages.VALIDATION.INVALID_PASSWORD,
      'string.min': errorMessages.VALIDATION.INVALID_PASSWORD,
      'any.required': 'New password is required.'
    })
});

// Update Profile Schema
const updateProfileSchema = Joi.object({
  full_name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': errorMessages.VALIDATION.INVALID_FULL_NAME,
      'any.required': errorMessages.VALIDATION.INVALID_FULL_NAME
    })
});

module.exports = {
  registerInitiateSchema,
  registerVerifyOtpSchema,
  resendOtpSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema
};
