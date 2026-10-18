const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const AppError = require('../utils/appError');
const HTTP_STATUS = require('../constants/httpStatusCodes');

/**
 * Authentication Middleware: Verifies JWT token and attaches user payload to req.user
 */
const authenticate = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError(
        'Authentication required. Please provide a valid Bearer token.',
        HTTP_STATUS.UNAUTHORIZED,
        'UNAUTHORIZED'
      )
    );
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Attach decoded user claims (id, email, role) to request
    req.user = decoded;
    next();
  } catch (error) {
    return next(error); // Caught by centralized errorHandler for JsonWebTokenError / TokenExpiredError
  }
};

module.exports = {
  authenticate
};
