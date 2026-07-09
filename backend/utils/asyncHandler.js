// utils/asyncHandler.js — wraps async route handlers so thrown/rejected
// errors are forwarded to Express's error-handling middleware instead of
// crashing the process or requiring a try/catch in every controller.

export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
