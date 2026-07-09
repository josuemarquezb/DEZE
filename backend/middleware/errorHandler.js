// middleware/errorHandler.js — shared error handling middleware.
// Registered last in server.js so it catches unmatched routes and thrown errors.

// Catches requests that don't match any route and forwards a 404 error.
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Final error handler — formats any thrown/passed error as JSON.
export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};
