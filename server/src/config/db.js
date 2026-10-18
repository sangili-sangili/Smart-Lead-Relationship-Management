const mongoose = require('mongoose');
const { MONGO_URI, NODE_ENV } = require('./env');

let isConnected = false;

// Attach persistent mongoose connection events
mongoose.connection.on('error', (err) => {
  console.error(`[Database Error] ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('[Database] MongoDB connection lost. Attempting reconnect...');
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  console.log('[Database] MongoDB successfully reconnected.');
});

/**
 * Connect to MongoDB instance using Mongoose ODM with tuned connection pooling
 * @param {string} [uri] Optional override URI
 * @returns {Promise<mongoose.Connection>}
 */
const connectDB = async (uri = MONGO_URI) => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(uri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 50,       // Maintain up to 50 socket connections
      minPoolSize: 10,       // Keep at least 10 sockets ready to handle bursts
      maxIdleTimeMS: 30000,  // Close idle sockets after 30 seconds
      socketTimeoutMS: 45000 // Close sockets after 45 seconds of inactivity
    });

    isConnected = conn.connections[0].readyState === 1;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host} / ${conn.connection.name} (Pool: 10-50 sockets)`);
    return conn.connection;
  } catch (error) {
    console.error(`[Database Error] MongoDB connection failed: ${error.message}`);
    if (NODE_ENV === 'production') {
      process.exit(1);
    }
    throw error;
  }
};

/**
 * Disconnect cleanly from MongoDB instance
 */
const disconnectDB = async () => {
  if (isConnected || mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[Database] MongoDB Disconnected gracefully.');
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  getConnectionStatus: () => isConnected
};
