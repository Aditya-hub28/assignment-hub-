const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const env = require('./config/env');
const routes = require('./routes');
const { globalLimiter } = require('./middleware/rateLimiter.middleware');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler.middleware');

const app = express();

// Security HTTP headers (allowing CDN scripts and images for frontend)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Request body parsing (supports up to 50MB file uploads)
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// HTTP Request logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Global API rate limiting for API routes
app.use(env.API_PREFIX, globalLimiter);

// Serve static frontend UI (React dist if built, otherwise public)
const fs = require('fs');
const frontendDistPath = path.join(__dirname, '../frontend/dist');

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
} else {
  app.use(express.static(path.join(__dirname, '../public')));
}

// Mount API routes
app.use(env.API_PREFIX, routes);

// SPA client-side routing fallback (for non-API GET requests)
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  const reactIndex = path.join(__dirname, '../frontend/dist/index.html');
  if (fs.existsSync(reactIndex)) {
    return res.sendFile(reactIndex);
  }
  next();
});

// Handle 404 Route Not Found for API
app.use(notFoundHandler);

// Centralized error handling
app.use(errorHandler);

module.exports = app;
