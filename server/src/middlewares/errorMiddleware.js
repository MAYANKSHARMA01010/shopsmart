const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

const routeNotFoundHandler = (req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
};

module.exports = {
  errorHandler,
  routeNotFoundHandler
};
