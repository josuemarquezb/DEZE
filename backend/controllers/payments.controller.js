// controllers/payments.controller.js — Stripe payments + detailer payouts (stubs).
//
// DEZE's 5% + 5% fee model (see computeJobFees in jobs.controller.js) means
// the amounts here are never DetailJob.agreedPrice directly:
//   - createPayment must charge the customer job.totalCustomerCost, not agreedPrice.
//   - requestPayout/payout transfers must pay the detailer job.detailerPayout, not agreedPrice.
//   - DEZE's take is job.customerFee + job.detailerFee (10% of agreedPrice) and is
//     never transferred out — it's just the gap between totalCustomerCost charged
//     in and detailerPayout paid out.

import { asyncHandler } from '../utils/asyncHandler.js';

/** Creates a Stripe SetupIntent so the customer can save a payment method. */
export const createSetupIntent = asyncHandler(async (req, res) => {
  res.status(501).json({ message: 'Not implemented: createSetupIntent' });
});

/** Charges the customer for a completed job (creates a Stripe PaymentIntent/charge). */
export const createPayment = asyncHandler(async (req, res) => {
  // TODO: load the job, then:
  //   stripe.paymentIntents.create({
  //     amount: Math.round(job.totalCustomerCost * 100), // cents; agreedPrice + 5% customer fee
  //     currency: 'usd',
  //     customer: <customer's Stripe customer id>,
  //     metadata: { jobId: job.id, agreedPrice: job.agreedPrice, customerFee: job.customerFee },
  //   });
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
  // TODO: load the completed/paid job(s), then:
  //   stripe.transfers.create({
  //     amount: Math.round(job.detailerPayout * 100), // cents; agreedPrice - 5% detailer fee
  //     currency: 'usd',
  //     destination: <detailer's Stripe Connect account id>,
  //   });
  res.status(501).json({ message: 'Not implemented: requestPayout' });
});
