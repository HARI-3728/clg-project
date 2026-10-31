/**
 * Standard Error Handling Middleware
 */

const notFound = (req, res, next) => {
  const error = new Error(`Resource Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  // If statusCode is 200, default to 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
};

module.exports = {
  notFound,
  errorHandler
};

