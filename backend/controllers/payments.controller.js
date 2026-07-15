// controllers/payments.controller.js — Stripe payments + detailer payouts (stubs).

import { asyncHandler } from '../utils/asyncHandler.js';

/** Creates a Stripe SetupIntent so the customer can save a payment method. */
export const createSetupIntent = asyncHandler(async (req, res) => {
  res.status(501).json({ message: 'Not implemented: createSetupIntent' });
});

/** Charges the customer for a completed job (creates a Stripe PaymentIntent/charge). */
export const createPayment = asyncHandler(async (req, res) => {
  res.status(501).json({ message: 'Not implemented: createPayment' });
});

/** Returns payment status/details for a given job. */
export const getPaymentForJob = asyncHandler(async (req, res) => {
  res.status(501).json({ message: 'Not implemented: getPaymentForJob' });
});

/** Returns the authenticated detailer's payout history (detailer). */
export const getPayouts = asyncHandler(async (req, res) => {
  res.status(501).json({ message: 'Not implemented: getPayouts' });
});

/** Requests an on-demand payout for the authenticated detailer (detailer). */
export const requestPayout = asyncHandler(async (req, res) => {
  res.status(501).json({ message: 'Not implemented: requestPayout' });
});
