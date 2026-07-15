// controllers/webhooks.controller.js — inbound Stripe webhook handling (stub).

import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Handles Stripe webhook events (subscription updates, invoice payments,
 * payout events, etc.). req.body arrives as a raw Buffer (see routes/webhooks.js
 * and server.js) so it can be verified against the Stripe-Signature header
 * using stripe.webhooks.constructEvent(...) and STRIPE_WEBHOOK_SECRET.
 */
export const handleStripeWebhook = asyncHandler(async (req, res) => {
  // TODO: const event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
  res.status(501).json({ message: 'Not implemented: handleStripeWebhook' });
});
