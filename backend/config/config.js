/**
 * Application Configuration
 * AI-Powered Healthcare Policy Intelligence & Prediction System
 */

require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET || (
  process.env.NODE_ENV === 'production'
    ? null
    : 'local-development-only-change-this-secret'
);

if (!jwtSecret) {
  throw new Error('JWT_SECRET must be set in production. Copy .env.example and configure a private random secret.');
}

module.exports = {
  PORT: process.env.PORT || 5000,
  FLASK_SERVICE_URL: process.env.FLASK_SERVICE_URL || 'http://localhost:5001',
  JWT_SECRET: jwtSecret,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  DB_PATH: process.env.DB_PATH || './healthcare_system.db',
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads'
};
