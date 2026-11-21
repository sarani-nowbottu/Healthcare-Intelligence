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
const flaskServiceAddress = process.env.FLASK_SERVICE_URL || 'http://localhost:5001';

if (!jwtSecret) {
  throw new Error('JWT_SECRET must be set in production. Add a private random value to the backend environment settings.');
}

module.exports = {
  PORT: process.env.PORT || 5000,
  FLASK_SERVICE_URL: /^https?:\/\//i.test(flaskServiceAddress)
    ? flaskServiceAddress
    : `http://${flaskServiceAddress}`,
  FLASK_SERVICE_TOKEN: process.env.FLASK_SERVICE_TOKEN || '',
  DATABASE_URL: process.env.DATABASE_URL || '',
  DATABASE_SSL: process.env.DATABASE_SSL === 'true',
  JWT_SECRET: jwtSecret,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  DB_PATH: process.env.DB_PATH || './healthcare_system.db',
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads'
};
