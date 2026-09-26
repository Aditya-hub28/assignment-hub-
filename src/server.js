const app = require('./app');
const env = require('./config/env');

const server = app.listen(env.PORT, () => {
  console.log('====================================================');
  console.log(`🚀 Assignment Hub Auth Server running on port ${env.PORT}`);
  console.log(`🌍 Environment: ${env.NODE_ENV}`);
  console.log(`🔗 API Base: http://localhost:${env.PORT}${env.API_PREFIX}`);
  console.log(`🩺 Health:   http://localhost:${env.PORT}${env.API_PREFIX}/health`);
  console.log('====================================================');
});

// Graceful shutdown handling
const handleShutdown = (signal) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });

  // Force close if graceful shutdown takes too long
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
