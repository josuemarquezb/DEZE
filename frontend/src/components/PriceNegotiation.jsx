// components/PriceNegotiation.jsx — shows the customer's budget vs. the
// detailer's proposed/agreed price, plus DEZE's 5% + 5% fee breakdown once a
// price is agreed (see computeJobFees in backend/controllers/jobs.controller.js).
// Only the assigned detailer can propose a price (see PUT /jobs/:id/price);
// there's no separate accept/reject step in the API — the customer sees the
// current agreedPrice update live once the detailer proposes one.
//
// `viewerRole` controls which side of the fee the viewer sees: a customer is
// shown what they'll pay (price + 5% fee = total), a detailer is shown what
// they'll keep (price - 5% fee = payout). Anyone else just sees the raw price.

import { useState } from 'react';

function PriceNegotiation({ job, canPropose, onPropose, viewerRole }) {
  const [price, setPrice] = useState(job.agreedPrice ?? job.budget ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!price || Number(price) <= 0) {
      setError('Enter a price greater than 0');
      return;
    }
    setSubmitting(true);
    try {
      await onPropose(Number(price));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to propose price.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-400">Customer's budget</span>
        <span className="font-medium text-white">${job.budget}</span>
      </div>
      <div className="mt-1 flex items-center justify-between text-sm">
        <span className="text-zinc-400">Agreed price</span>
        <span className="font-medium text-accent">{job.agreedPrice != null ? `$${job.agreedPrice}` : 'Not set yet'}</span>
      </div>

      {job.agreedPrice != null && viewerRole === 'CUSTOMER' && job.totalCustomerCost != null && (
        <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-sm">
          <p className="text-zinc-300">
            Agreed Price: <span className="text-white">${job.agreedPrice}</span> + 5% DEZE Fee:{' '}
            <span className="text-white">${job.customerFee}</span> = Total:{' '}
            <span className="font-semibold text-accent">${job.totalCustomerCost}</span>
          </p>
          <p className="mt-1 text-xs text-zinc-500">This is the full amount you'll be charged.</p>
        </div>
      )}

      {job.agreedPrice != null && viewerRole === 'DETAILER' && job.detailerPayout != null && (
        <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-sm">
          <p className="text-zinc-300">
            Agreed Price: <span className="text-white">${job.agreedPrice}</span> - 5% DEZE Fee:{' '}
            <span className="text-white">${job.detailerFee}</span> = Your Payout:{' '}
            <span className="font-semibold text-accent">${job.detailerPayout}</span>
          </p>
          <p className="mt-1 text-xs text-zinc-500">This is what you'll actually receive for this job.</p>
        </div>
      )}

      {canPropose && (
        <form onSubmit={handleSubmit} className="mt-4 flex items-end gap-3 border-t border-zinc-800 pt-4">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-zinc-400">Propose a price ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-white focus:border-accent focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-zinc-950 hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? 'Sending...' : 'Propose'}
          </button>
        </form>
      )}
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}

export default PriceNegotiation;
