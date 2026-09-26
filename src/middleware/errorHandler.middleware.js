const env = require('../config/env');
const errorMessages = require('../constants/errorMessages');

/**
 * Global 404 Route Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`
    }
  });
};

/**
 * Centralized Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST');
  const message = err.message || errorMessages.SERVER.INTERNAL_ERROR;

  // Log internal server errors
  if (statusCode >= 500) {
    console.error(`[SERVER ERROR] [${new Date().toISOString()}] ${req.method} ${req.originalUrl}:`, err);
  } else if (env.NODE_ENV === 'development') {
    console.warn(`[WARN] [${statusCode}] ${err.message}`);
  }

  const response = {
    success: false,
    error: {
      code: errorCode,
      message: statusCode >= 500 && env.NODE_ENV === 'production' 
        ? errorMessages.SERVER.INTERNAL_ERROR 
        : message
    }
  };

  if (env.NODE_ENV === 'development' && statusCode >= 500 && err.stack) {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = {
  notFoundHandler,
  errorHandler
};
