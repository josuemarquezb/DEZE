// routes/detailers.js — DetailerProfile endpoints. Mounted at /api/detailers.
// NOTE: literal paths (/nearby, /search, /me/stats, /verify) are registered
// before '/:id' so they aren't swallowed by the param route.

import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import * as detailersController from '../controllers/detailers.controller.js';

const router = Router();

/** GET /api/detailers/nearby — find detailers near a point (query: lat, lng, radius). */
router.get('/nearby', detailersController.getNearby);

/** GET /api/detailers/search — search/filter detailers (query: serviceType, minRating, etc.). */
router.get('/search', detailersController.search);

/** GET /api/detailers/me/stats — the authenticated detailer's own stats (protected). */
router.get('/me/stats', requireAuth, requireRole('DETAILER'), detailersController.getMyStats);

/** GET /api/detailers/me — the authenticated detailer's own full profile (protected). */
router.get('/me', requireAuth, requireRole('DETAILER'), detailersController.getMe);

/** PUT /api/detailers/me — update the authenticated detailer's own profile (protected). */
router.put('/me', requireAuth, requireRole('DETAILER'), detailersController.updateMe);

/** POST /api/detailers/verify — submit for verification review (protected). Upload docs first via POST /api/photos/verification. */
router.post('/verify', requireAuth, requireRole('DETAILER'), detailersController.submitVerification);

/** GET /api/detailers/:id — a detailer's public profile. */
router.get('/:id', detailersController.getPublicProfile);

export default router;
