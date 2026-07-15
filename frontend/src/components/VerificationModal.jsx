// components/VerificationModal.jsx — review a pending detailer's profile +
// uploaded documents, then approve or reject their verification.

import { useState } from 'react';
import PhotoGallery from './PhotoGallery.jsx';
import { SERVICE_TYPE_LABELS } from '../constants/serviceTypes.js';

/**
 * @param {object} detailer
 * @param {() => Promise<void>} onApprove
 * @param {() => Promise<void>} onReject
 * @param {() => void} onClose
 */
function VerificationModal({ detailer, onApprove, onReject, onClose }) {
  const [submitting, setSubmitting] = useState(null); // 'APPROVED' | 'REJECTED' | null
  const [error, setError] = useState(null);

  const run = async (action, fn) => {
    setError(null);
    setSubmitting(action);
    try {
      await fn();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {detailer.firstName} {detailer.lastName}
            </h2>
            <p className="text-sm text-zinc-500">{detailer.email}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-zinc-500 hover:text-white">
            ✕
          </button>
        </div>

        <p className="mb-4 text-sm text-zinc-300">{detailer.bio || 'No bio provided.'}</p>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {detailer.serviceTypes.map((type) => (
            <span key={type} className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
              {SERVICE_TYPE_LABELS[type] || type}
            </span>
          ))}
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3 text-sm text-zinc-400">
          <p>Years experience: {detailer.yearsExperience ?? '—'}</p>
          <p>Hourly rate: {detailer.hourlyRate ? `$${detailer.hourlyRate}` : '—'}</p>
        </div>

        <div className="mb-4">
          <h3 className="mb-2 text-sm font-semibold text-zinc-300">Equipment photos</h3>
          <PhotoGallery photos={detailer.equipmentPhotos || []} emptyText="No equipment photos uploaded." />
        </div>

        <div className="mb-6">
          <h3 className="mb-2 text-sm font-semibold text-zinc-300">Verification documents</h3>
          <PhotoGallery photos={detailer.verificationDocs || []} emptyText="No verification documents uploaded." />
        </div>

        {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={() => run('APPROVED', onApprove)}
            disabled={submitting !== null}
            className="flex-1 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-zinc-950 hover:opacity-90 disabled:opacity-50"
          >
            {submitting === 'APPROVED' ? 'Approving...' : 'Approve'}
          </button>
          <button
            onClick={() => run('REJECTED', onReject)}
            disabled={submitting !== null}
            className="flex-1 rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50"
          >
            {submitting === 'REJECTED' ? 'Rejecting...' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerificationModal;
