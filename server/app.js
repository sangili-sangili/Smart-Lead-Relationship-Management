const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { CLIENT_URL, NODE_ENV } = require('./src/config/env');
const apiRoutes = require('./src/routes');
const errorHandler = require('./src/middleware/errorMiddleware');
const AppError = require('./src/utils/appError');
const HTTP_STATUS = require('./src/constants/httpStatusCodes');

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// HTTP Request logging
if (NODE_ENV !== 'test') {
  app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to LeadFlow CRM API',
    status: 'online',
    version: '1.0.0',
    documentation: '/api/health'
  });
});

// API Routes
app.use('/api', apiRoutes);

// Catch-all for unhandled routes (404)
app.use('*', (req, res, next) => {
  next(
    new AppError(
      `Route ${req.originalUrl} not found on this server.`,
      HTTP_STATUS.NOT_FOUND,
      'ROUTE_NOT_FOUND'
    )
  );
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
