const app = require('./app');
const { PORT, NODE_ENV } = require('./src/config/env');
const { connectDB, disconnectDB } = require('./src/config/db');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION! Shutting down...]', err.name, err.message);
  process.exit(1);
});

// Connect to MongoDB
connectDB();

// Start Express HTTP Server
const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`  LeadFlow CRM Server Running on Port: ${PORT}`);
  console.log(`  Environment: ${NODE_ENV}`);
  console.log(`  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('[UNHANDLED REJECTION! Shutting down...]', err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Graceful shutdown on termination signals
const handleGracefulShutdown = async (signal) => {
  console.log(`\n[${signal}] Graceful shutdown initiated...`);
  server.close(async () => {
    console.log('[Server] HTTP server closed.');
    await disconnectDB();
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
