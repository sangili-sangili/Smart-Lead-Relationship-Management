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

// CORS configuration supporting dynamic portal & localhost origins
const allowedOrigins = [
  CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server or tools with no origin
    if (!origin) return callback(null, true);
    
    // Check if origin matches allowed origins, onrender.com subdomains, or local dev ports
    const isAllowed =
      allowedOrigins.includes(origin) ||
      /\.onrender\.com$/.test(origin) ||
      /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

    if (isAllowed) {
      return callback(null, true);
    }
    return callback(new Error(`CORS Error: Origin ${origin} not allowed by Access-Control`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
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
