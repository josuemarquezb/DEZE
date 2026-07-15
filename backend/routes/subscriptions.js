// routes/subscriptions.js — detailer platform subscription endpoints.
// Mounted at /api/subscriptions. The Stripe webhook lives in routes/webhooks.js
// (mounted separately in server.js) since it needs the raw request body.

import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import * as subscriptionsController from '../controllers/subscriptions.controller.js';

const router = Router();

/** GET /api/subscriptions/me — the authenticated detailer's own subscription (protected). */
router.get('/me', requireAuth, requireRole('DETAILER'), subscriptionsController.getMySubscription);

/** POST /api/subscriptions/checkout — create a Stripe Checkout session to start a subscription (protected). */
router.post('/checkout', requireAuth, requireRole('DETAILER'), subscriptionsController.createCheckoutSession);

/** POST /api/subscriptions/cancel — cancel the authenticated detailer's subscription (protected). */
router.post('/cancel', requireAuth, requireRole('DETAILER'), subscriptionsController.cancelSubscription);

/** PUT /api/subscriptions/pause — pause the authenticated detailer's subscription (protected). */
router.put('/pause', requireAuth, requireRole('DETAILER'), subscriptionsController.pauseSubscription);

export default router;
