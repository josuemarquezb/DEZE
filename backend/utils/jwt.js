// utils/jwt.js — JWT issuing/verification for authenticated requests.

import jwt from 'jsonwebtoken';

const TOKEN_EXPIRY = '24h';

/** Signs a JWT carrying { userId, userType }, expiring in 24 hours. */
export const generateToken = (userId, userType) =>
  jwt.sign({ userId, userType }, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

/** Verifies a JWT and returns its decoded payload. Throws if invalid/expired. */
export const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);
