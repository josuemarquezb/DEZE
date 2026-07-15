// middleware/auth.js — JWT authentication + role-based access guards.

import { verifyToken } from '../utils/jwt.js';
import prisma from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * requireAuth — verifies the Bearer JWT from the Authorization header and
 * attaches { userId, userType } to req.user. Responds 401 if missing/invalid.
 */
export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = { userId: decoded.userId, userType: decoded.userType };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, invalid or expired token' });
  }
};

/**
 * requireRole(...roles) — restricts a route to specific User.userType values
 * (e.g. 'CUSTOMER', 'DETAILER'). Must run after requireAuth.
 */
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  if (roles.length && !roles.includes(req.user.userType)) {
    console.log(`[DEBUG requireRole] 403 on ${req.method} ${req.originalUrl} — required=[${roles}] got userType=${req.user.userType} userId=${req.user.userId}`);
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

/**
 * requireAdmin — restricts a route to platform admins. Must run after
 * requireAuth. Checks User.isAdmin against the database rather than trusting
 * a claim baked into the JWT, so revoking admin access takes effect
 * immediately instead of waiting out the token's 24h expiry.
 */
export const requireAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.userId }, select: { isAdmin: true } });
  if (!user?.isAdmin) {
    return res.status(403).json({ message: 'Forbidden — admin access required' });
  }

  next();
});
