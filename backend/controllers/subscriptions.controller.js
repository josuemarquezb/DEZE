// controllers/subscriptions.controller.js — detailer platform subscription logic (stubs).
// The Stripe webhook that keeps subscription state in sync lives in
// controllers/webhooks.controller.js, since it needs the raw request body.

import { asyncHandler } from '../utils/asyncHandler.js';

/** Returns the authenticated detailer's own subscription. */
export const getMySubscription = asyncHandler(async (req, res) => {
  res.status(501).json({ message: 'Not implemented: getMySubscription' });
});

/** Creates a Stripe Checkout session for starting a subscription. */
export const createCheckoutSession = asyncHandler(async (req, res) => {
  res.status(501).json({ message: 'Not implemented: createCheckoutSession' });
});

/** Cancels the authenticated detailer's subscription. */
export const cancelSubscription = asyncHandler(async (req, res) => {
  res.status(501).json({ message: 'Not implemented: cancelSubscription' });
});

/** Pauses the authenticated detailer's subscription. */
export const pauseSubscription = asyncHandler(async (req, res) => {
  res.status(501).json({ message: 'Not implemented: pauseSubscription' });
});
