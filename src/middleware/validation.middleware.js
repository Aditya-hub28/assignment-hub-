/**
 * Joi Schema Validation Middleware Generator
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: details[0].message,
          details
        }
      });
    }

    // Replace request payload with sanitized, trimmed, stripped values
    req[property] = value;
    next();
  };
};

module.exports = { validate };
