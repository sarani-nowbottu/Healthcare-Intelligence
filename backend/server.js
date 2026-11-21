/**
 * Main Application Server (Express.js MVC)
 * AI-Powered Healthcare Policy Intelligence & Prediction System
 * Runs on Port 5000
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const config = require('./config/config');
const db = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const mlRoutes = require('./routes/mlRoutes');
const policyRoutes = require('./routes/policyRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const aiRoutes = require('./routes/aiRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');

const app = express();

// Ensure upload directory exists
const uploadDir = path.resolve(__dirname, config.UPLOAD_DIR);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Global Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'Healthcare Intelligence Express Backend',
    port: config.PORT,
    timestamp: new Date().toISOString()
  });
});

// REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Error Handler Middleware
app.use(errorHandler);

const PORT = config.PORT;
if (process.env.NODE_ENV !== 'test') {
  db.initPromise
    .then(() => {
      const server = app.listen(PORT, () => {
        console.log(`=======================================================`);
        console.log(`AI-Powered Healthcare Policy Intelligence & Prediction System`);
        console.log(`Express MVC Backend running at: http://localhost:${PORT}`);
        console.log(`Flask Microservice URL: ${config.FLASK_SERVICE_URL}`);
        console.log(`=======================================================`);
      });

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.error(`Port ${PORT} is already in use. Another service may already be running there. Check http://localhost:${PORT}/health, or stop the process using port ${PORT} before restarting this backend.`);
          process.exitCode = 1;
          return;
        }

        console.error('Backend failed to start:', err);
        process.exitCode = 1;
      });
    })
    .catch((err) => {
      console.error('Backend startup failed: SQLite database initialization did not complete.', err);
      process.exitCode = 1;
    });
}

module.exports = app;
