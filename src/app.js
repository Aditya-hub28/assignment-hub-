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

// Launch Configuration: 5th October 2026, 7:00 PM IST (19:00:00)
const fs = require('fs');
const LAUNCH_TIMESTAMP = process.env.LAUNCH_TIMESTAMP
  ? Number(process.env.LAUNCH_TIMESTAMP)
  : (process.env.LAUNCH_TIME
      ? new Date(process.env.LAUNCH_TIME).getTime()
      : new Date('2026-10-05T19:00:00+05:30').getTime());

const isLaunchLive = (req) => {
  if (process.env.FORCE_LIVE === 'true') return true;
  if (req) {
    const q = req.query || {};
    if (q.live === '1' || q.live === 'true' || q.preview === 'live') return true;
    if (req.headers && req.headers['x-bypass-countdown'] === 'true') return true;
  }
  return Date.now() >= LAUNCH_TIMESTAMP;
};

// Check launch status API endpoint
app.get('/api/v1/launch-status', (req, res) => {
  const isLive = isLaunchLive(req);
  res.json({
    isLive,
    launchTime: '2026-10-05T19:00:00+05:30',
    launchTimestamp: LAUNCH_TIMESTAMP,
    currentTime: new Date().toISOString(),
    remainingSeconds: Math.max(0, Math.floor((LAUNCH_TIMESTAMP - Date.now()) / 1000))
  });
});

// Mount main API routes
app.use(env.API_PREFIX, routes);

// Countdown waitlist form submission (POST / or POST /waitlist)
app.post(['/', '/waitlist', '/api/v1/waitlist'], (req, res, next) => {
  if (isLaunchLive(req) && req.path === '/') return next();

  const email = (req.body && (req.body['student-email'] || req.body.email || req.body.student_email)) || '';
  console.log(`[WAITLIST] Registered email: ${email}`);

  try {
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    const waitlistFile = path.join(dataDir, 'waitlist.json');
    let waitlist = [];
    if (fs.existsSync(waitlistFile)) {
      try {
        waitlist = JSON.parse(fs.readFileSync(waitlistFile, 'utf8') || '[]');
      } catch (e) {
        waitlist = [];
      }
    }
    if (email && !waitlist.some(item => (typeof item === 'string' ? item === email : item.email === email))) {
      waitlist.push({ email, timestamp: new Date().toISOString() });
      fs.writeFileSync(waitlistFile, JSON.stringify(waitlist, null, 2), 'utf8');
    }
  } catch (err) {
    console.error('[WAITLIST] Error saving waitlist entry:', err.message);
  }

  return res.status(200).json({ status: 'success', message: 'Waitlist saved successfully.' });
});

// Paths for countdown and live web app
const countdownPath = path.join(__dirname, '../countdown');
const frontendDistPath = path.join(__dirname, '../frontend/dist');
const publicPath = path.join(__dirname, '../public');

// Sneak Peek route
app.get(['/sneak-peek', '/sneak-peek.html'], (req, res, next) => {
  if (isLaunchLive(req)) return next();
  const sneakPeekFile = path.join(countdownPath, 'sneak-peek.html');
  if (fs.existsSync(sneakPeekFile)) {
    return res.sendFile(sneakPeekFile);
  }
  next();
});

// Countdown static assets (when countdown is active)
app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  if (!isLaunchLive(req)) {
    return express.static(countdownPath)(req, res, next);
  }
  next();
});

// Live app static assets (when launch time reached)
app.use((req, res, next) => {
  if (!isLaunchLive(req)) {
    return next();
  }
  if (fs.existsSync(frontendDistPath)) {
    return express.static(frontendDistPath)(req, res, next);
  }
  return express.static(publicPath)(req, res, next);
});

// Fallback routing: Countdown index.html before launch, React SPA after launch
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }

  if (!isLaunchLive(req)) {
    return res.sendFile(path.join(countdownPath, 'index.html'));
  }

  const reactIndex = path.join(frontendDistPath, 'index.html');
  if (fs.existsSync(reactIndex)) {
    return res.sendFile(reactIndex);
  }
  const publicIndex = path.join(publicPath, 'index.html');
  if (fs.existsSync(publicIndex)) {
    return res.sendFile(publicIndex);
  }
  next();
});

// Handle 404 Route Not Found for API
app.use(notFoundHandler);

// Centralized error handling
app.use(errorHandler);

module.exports = app;
