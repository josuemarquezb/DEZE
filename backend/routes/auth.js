// routes/auth.js — authentication endpoints. Mounted at /api/auth.

import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middleware/validation.js';

const router = Router();

/** POST /api/auth/signup — create a new account (customer or detailer). */
router.post('/signup', validate(/* signupSchema */), authController.signup);

/** POST /api/auth/login — authenticate with email/password and receive a JWT. */
router.post('/login', validate(/* loginSchema */), authController.login);

/** POST /api/auth/logout — end the current session. */
router.post('/logout', authController.logout);

/** POST /api/auth/forgot-password — request a password reset email. */
router.post('/forgot-password', authController.forgotPassword);

/** POST /api/auth/reset-password — complete a password reset using a reset token. */
router.post('/reset-password', authController.resetPassword);

export default router;
