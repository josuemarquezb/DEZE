// routes/users.js — shared user account endpoints. Mounted at /api/users.
// NOTE: '/me' is registered before '/:id' so it isn't swallowed by the param route.

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as usersController from '../controllers/users.controller.js';

const router = Router();

/** GET /api/users/me — the authenticated user's own profile (protected). */
router.get('/me', requireAuth, usersController.getMe);

/** PUT /api/users/me — update the authenticated user's own profile (protected). */
router.put('/me', requireAuth, usersController.updateMe);

/** POST /api/users/upload-photo — upload/replace the profile photo (protected). */
router.post('/upload-photo', requireAuth, usersController.uploadPhoto);

/** GET /api/users/:id — a user's public profile. */
router.get('/:id', usersController.getPublicProfile);

export default router;
