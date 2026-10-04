const Joi = require('joi');

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'png', 'jpg', 'jpeg', 'zip', 'rar'];
const MAX_TOTAL_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

// Custom validator for file extension and size
const fileItemSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'File name is required'
  }),
  size: Joi.number().min(0).max(MAX_TOTAL_FILE_SIZE_BYTES).required().messages({
    'number.max': 'Individual file size cannot exceed 50 MB'
  }),
  type: Joi.string().allow('', null).optional(),
  extension: Joi.string().lowercase().optional(),
  data: Joi.string().allow('', null).optional(), // base64 or dataUrl
  url: Joi.string().allow('', null).optional()
}).custom((value, helpers) => {
  // Extract extension from file name or extension property
  const ext = value.extension || value.name.split('.').pop().toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return helpers.error('file.invalidExtension', { ext, allowed: ALLOWED_EXTENSIONS.join(', ') });
  }
  return value;
}).messages({
  'file.invalidExtension': 'File "{{#name}}" has an unsupported extension (.{{#ext}}). Allowed: {{#allowed}}'
});

const createServiceRequestSchema = Joi.object({
  service: Joi.string().trim().required().messages({
    'string.empty': 'Service selection is required',
    'any.required': 'Service selection is required'
  }),
  isCustom: Joi.boolean().default(false),
  customServiceName: Joi.string().trim().when('isCustom', {
    is: true,
    then: Joi.required().messages({
      'string.empty': 'Please specify your custom service requirement name',
      'any.required': 'Custom service requirement name is required'
    }),
    otherwise: Joi.optional().allow('', null)
  }),
  title: Joi.string().trim().min(3).max(250).required().messages({
    'string.empty': 'Topic or Title is required',
    'string.min': 'Topic or Title must be at least 3 characters',
    'string.max': 'Topic or Title cannot exceed 250 characters',
    'any.required': 'Topic or Title is required'
  }),
  subject: Joi.string().trim().min(2).max(150).required().messages({
    'string.empty': 'Subject or Course area is required',
    'string.min': 'Subject must be at least 2 characters',
    'string.max': 'Subject cannot exceed 150 characters',
    'any.required': 'Subject is required'
  }),
  description: Joi.string().trim().min(10).max(10000).required().messages({
    'string.empty': 'Requirements or Description is required',
    'string.min': 'Description must be at least 10 characters',
    'string.max': 'Description cannot exceed 10000 characters',
    'any.required': 'Requirements or Description is required'
  }),
  deadline: Joi.date().iso().required().messages({
    'date.base': 'Please provide a valid deadline date',
    'date.format': 'Deadline date must be in ISO format (YYYY-MM-DD)',
    'any.required': 'Deadline is required'
  }),
  additionalInstructions: Joi.string().trim().max(3000).allow('', null).optional(),
  serviceSpecific: Joi.object().unknown(true).default({}),
  files: Joi.array().items(fileItemSchema).default([]).custom((files, helpers) => {
    const totalSize = files.reduce((acc, f) => acc + (f.size || 0), 0);
    if (totalSize > MAX_TOTAL_FILE_SIZE_BYTES) {
      return helpers.error('files.maxTotalSize', {
        totalMB: (totalSize / (1024 * 1024)).toFixed(2),
        maxMB: 50
      });
    }
    return files;
  }).messages({
    'files.maxTotalSize': 'Total size of uploaded files ({{#totalMB}} MB) exceeds the 50 MB limit'
  }),
  userName: Joi.string().trim().allow('', null).optional(),
  userEmail: Joi.string().email().allow('', null).optional()
});

module.exports = {
  createServiceRequestSchema,
  ALLOWED_EXTENSIONS,
  MAX_TOTAL_FILE_SIZE_BYTES
};
