const Joi = require('joi');

const ALLOWED_REQUEST_STATUSES = [
  'pending',
  'in_review',
  'in_progress',
  'completed',
  'delivered',
  'cancelled'
];

const updateRequestStatusSchema = Joi.object({
  status: Joi.string()
    .trim()
    .lowercase()
    .valid(...ALLOWED_REQUEST_STATUSES)
    .required()
    .messages({
      'any.only': `Status must be one of: ${ALLOWED_REQUEST_STATUSES.join(', ')}`,
      'any.required': 'Status is required'
    }),
  statusLabel: Joi.string()
    .trim()
    .max(50)
    .optional(),
  progress: Joi.number()
    .integer()
    .min(0)
    .max(100)
    .optional()
});

const sendInquiryMessageSchema = Joi.object({
  content: Joi.string()
    .trim()
    .min(1)
    .max(5000)
    .required()
    .messages({
      'string.empty': 'Message content cannot be empty',
      'any.required': 'Message content is required'
    }),
  attachments: Joi.array()
    .items(Joi.object())
    .optional()
    .default([])
});

const requestsQuerySchema = Joi.object({
  status: Joi.string().trim().optional(),
  service: Joi.string().trim().optional(),
  search: Joi.string().trim().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

const inquiriesQuerySchema = Joi.object({
  status: Joi.string().trim().optional(),
  search: Joi.string().trim().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

const usersQuerySchema = Joi.object({
  search: Joi.string().trim().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

module.exports = {
  ALLOWED_REQUEST_STATUSES,
  updateRequestStatusSchema,
  sendInquiryMessageSchema,
  requestsQuerySchema,
  inquiriesQuerySchema,
  usersQuerySchema
};
