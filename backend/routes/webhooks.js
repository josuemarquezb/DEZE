// routes/webhooks.js — inbound webhook endpoints. Mounted at /api/webhooks.
//
// IMPORTANT: Stripe verifies webhook signatures against the *raw* request
// body, so this router must be mounted with express.raw({ type: 'application/json' })
// BEFORE the app's global express.json() middleware — see server.js. Public
// (no requireAuth): Stripe authenticates via the signature header instead.

import { Router } from 'express';
import * as webhooksController from '../controllers/webhooks.controller.js';

const router = Router();

/** POST /api/webhooks/stripe — Stripe event receiver (subscriptions, invoices, payouts). */
router.post('/stripe', webhooksController.handleStripeWebhook);

export default router;
