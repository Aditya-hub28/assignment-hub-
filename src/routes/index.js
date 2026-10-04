const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const serviceRequestRoutes = require('./serviceRequest.routes');

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    service: 'Assignment Hub Authentication Service',
    timestamp: new Date().toISOString()
  });
});

// Authentication routes
router.use('/auth', authRoutes);

// User and Profile routes
router.use('/user', userRoutes);

// Service Request routes
router.use('/services', serviceRequestRoutes);
router.use('/requests', serviceRequestRoutes);

module.exports = router;
