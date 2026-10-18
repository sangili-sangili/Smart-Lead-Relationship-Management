const dotenv = require('dotenv');
const path = require('path');

// Load .env from server root
dotenv.config({ path: path.join(__dirname, '../../.env') });

const requiredEnvVars = ['JWT_SECRET'];

// Validate critical variables in production
if (process.env.NODE_ENV === 'production') {
  requiredEnvVars.push('MONGO_URI');
  const missing = requiredEnvVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/leadflow_crm',
  JWT_SECRET: process.env.JWT_SECRET || 'leadflow_crm_fallback_dev_secret_key_32chars',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173'
};
