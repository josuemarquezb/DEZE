// routes/payments.js — Stripe payments + detailer payouts.
// Defines full '/payments/*' and '/payouts/*' paths itself (they don't share
// a single prefix) and is mounted at the API root in routes/index.js.

import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import * as paymentsController from '../controllers/payments.controller.js';

const router = Router();

// --- Payments ---

/** POST /api/payments/setup-intent — create a Stripe SetupIntent for saving a payment method (protected). */
router.post('/payments/setup-intent', requireAuth, paymentsController.createSetupIntent);

/** POST /api/payments/create — charge the customer for a completed job (protected). */
router.post('/payments/create', requireAuth, paymentsController.createPayment);

/** GET /api/payments/:jobId — payment status/details for a job (protected). */
router.get('/payments/:jobId', requireAuth, paymentsController.getPaymentForJob);

// --- Payouts ---

/** GET /api/payouts — the authenticated detailer's payout history (protected, detailer). */
router.get('/payouts', requireAuth, requireRole('DETAILER'), paymentsController.getPayouts);

/** POST /api/payouts/request — request an on-demand payout (protected, detailer). */
router.post('/payouts/request', requireAuth, requireRole('DETAILER'), paymentsController.requestPayout);

export default router;
