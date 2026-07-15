// components/PriceNegotiation.jsx — shows the customer's budget vs. the
// detailer's proposed/agreed price. Only the assigned detailer can propose a
// price (see PUT /jobs/:id/price in backend/controllers/jobs.controller.js);
// there's no separate accept/reject step in the API — the customer sees the
// current agreedPrice update live once the detailer proposes one.

import { useState } from 'react';

function PriceNegotiation({ job, canPropose, onPropose }) {
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
