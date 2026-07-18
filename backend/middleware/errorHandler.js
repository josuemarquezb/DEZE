// middleware/errorHandler.js — shared error handling middleware.
// Registered last in server.js so it catches unmatched routes and thrown errors.

// Catches requests that don't match any route and forwards a 404 error.
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Final error handler — formats any thrown/passed error as JSON.
// Most 4xx responses are returned directly by controllers (never reach here);
// what lands here is almost always an unexpected 500 from a bug (e.g. a
// Prisma error). In production that raw err.message can contain internal
// details (table/column names, query shape) — log it server-side but send
// the client a generic message instead of leaking it.
export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  const isProduction = process.env.NODE_ENV === 'production';

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    message: isProduction && statusCode >= 500 ? 'Something went wrong. Please try again later.' : err.message,
    stack: isProduction ? undefined : err.stack,
  });
};
