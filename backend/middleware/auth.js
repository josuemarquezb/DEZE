// middleware/auth.js — JWT auth guard (placeholder).
// Will extract the Bearer token, verify it with process.env.JWT_SECRET,
// and attach the decoded user to req.user before calling next().

import jwt from 'jsonwebtoken';

export const requireAuth = (req, res, next) => {
  // TODO: implement token extraction + verification.
  // const token = req.headers.authorization?.split(' ')[1];
  // if (!token) return res.status(401).json({ message: 'Not authorized' });
  // req.user = jwt.verify(token, process.env.JWT_SECRET);
  next();
};
