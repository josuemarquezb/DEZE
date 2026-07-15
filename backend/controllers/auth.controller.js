// controllers/auth.controller.js — authentication business logic.

import crypto from 'crypto';
import prisma from '../config/db.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { isValidEmail, isValidPassword } from '../utils/validators.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { notifyUser, notifyAdminNewSubscriber } from './notifications.controller.js';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const USER_TYPES = ['CUSTOMER', 'DETAILER'];

const toPublicUser = (user) => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  userType: user.userType,
  isAdmin: user.isAdmin,
});

/** Creates a new User (+ CustomerProfile or DetailerProfile) and returns a JWT. */
export const signup = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, userType } = req.body;

  if (!email || !password || !firstName || !lastName || !userType) {
    return res
      .status(400)
      .json({ message: 'email, password, firstName, lastName, and userType are required' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (!isValidPassword(password)) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  if (!USER_TYPES.includes(userType)) {
    return res.status(400).json({ message: 'userType must be CUSTOMER or DETAILER' });
  }

  const normalizedEmail = email.toLowerCase();

  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    console.warn(`[auth] signup rejected — email already registered (${normalizedEmail})`);
    return res.status(409).json({ message: 'An account with this email already exists' });
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email: normalizedEmail,
        password: passwordHash,
        firstName,
        lastName,
        userType,
      },
    });

    if (userType === 'CUSTOMER') {
      await tx.customerProfile.create({ data: { userId: created.id } });
    } else {
      await tx.detailerProfile.create({ data: { userId: created.id } });
    }

    return created;
  });

  const token = generateToken(user.id, user.userType);

  console.log(`[auth] signup success — user=${user.id} type=${user.userType}`);

  if (userType === 'DETAILER') {
    // Fire-and-forget: the welcome email/notification and the low-priority
    // admin ping should never delay or fail the signup response itself.
    notifyUser(user.id, 'WELCOME', { firstName: user.firstName }, { email: true });
    notifyAdminNewSubscriber({ firstName: user.firstName, lastName: user.lastName, email: user.email });
  }

  res.status(201).json({
    user: toPublicUser(user),
    token,
    expiresIn: '24h',
  });
});

/** Verifies email/password and returns a JWT. */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  if (!user) {
    console.warn(`[auth] login failed — no account for email=${email}`);
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const passwordMatches = await verifyPassword(password, user.password);

  if (!passwordMatches) {
    console.warn(`[auth] login failed — bad password for user=${user.id}`);
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = generateToken(user.id, user.userType);

  console.log(`[auth] login success — user=${user.id}`);

  res.status(200).json({
    user: toPublicUser(user),
    token,
    expiresIn: '24h',
  });
});

/** Ends the current session. JWTs are stateless, so there's nothing server-side to destroy yet. */
export const logout = asyncHandler(async (req, res) => {
  // TODO: if a refresh-token or blacklist scheme is added later, invalidate it here.
  res.status(200).json({ message: 'Logged out successfully' });
});

/** Issues a password reset token for the given email, if it belongs to an account. */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ message: 'A valid email is required' });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  // Always respond the same way whether or not the account exists, so this
  // endpoint can't be used to enumerate registered emails.
  if (user) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });

    // TODO (Phase 2): email `rawToken` to the user via nodemailer instead of
    // logging it — the raw token must never be logged in production.
    console.log(`[auth] password reset requested — user=${user.id} rawToken=${rawToken}`);
  } else {
    console.warn(`[auth] password reset requested for unknown email=${email}`);
  }

  res.status(200).json({ message: 'Check your email for reset link' });
});

/** Verifies a reset token and updates the user's password. */
export const resetPassword = asyncHandler(async (req, res) => {
  const { resetToken, newPassword } = req.body;

  if (!resetToken || !newPassword) {
    return res.status(400).json({ message: 'resetToken and newPassword are required' });
  }

  if (!isValidPassword(newPassword)) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

  const resetRecord = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!resetRecord || resetRecord.expiresAt < new Date()) {
    console.warn('[auth] password reset failed — invalid or expired token');
    return res.status(400).json({ message: 'Invalid or expired reset token' });
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({ where: { id: resetRecord.userId }, data: { password: passwordHash } }),
    prisma.passwordResetToken.delete({ where: { id: resetRecord.id } }),
  ]);

  console.log(`[auth] password reset completed — user=${resetRecord.userId}`);

  res.status(200).json({ message: 'Password reset successfully' });
});
