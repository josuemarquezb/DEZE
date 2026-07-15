// pages/AdminDetailers.jsx — admin: browse/filter/search all detailers, approve or reject pending ones.

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DetailerTable from '../components/DetailerTable.jsx';
import SearchBar from '../components/SearchBar.jsx';
import VerificationModal from '../components/VerificationModal.jsx';
import * as adminService from '../services/adminService.js';
import { VERIFICATION_STATUSES } from '../constants/verificationStatus.js';

function AdminDetailers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const verificationStatus = searchParams.get('verificationStatus') || '';
  const search = searchParams.get('search') || '';

  const [detailers, setDetailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewing, setReviewing] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    adminService
      .getAllDetailers({ verificationStatus: verificationStatus || undefined, search: search || undefined })
      .then(setDetailers)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load detailers.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [verificationStatus, search]);

  const setFilter = (status) => {
    const next = new URLSearchParams(searchParams);
    if (status) next.set('verificationStatus', status);
    else next.delete('verificationStatus');
    setSearchParams(next);
  };

  const setSearch = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set('search', value);
    else next.delete('search');
    setSearchParams(next);
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold text-white">Detailers</h1>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {['', ...VERIFICATION_STATUSES].map((status) => (
            <button
              key={status || 'ALL'}
              onClick={() => setFilter(status)}
              className={`rounded-lg border px-3 py-1.5 text-sm ${
                verificationStatus === status
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              {status || 'All'}
            </button>
          ))}
        </div>
        <div className="w-full sm:w-64">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name or email..." />
        </div>
      </div>

      {loading ? (
        <p className="py-8 text-center text-zinc-400">Loading detailers...</p>
      ) : error ? (
        <p className="py-8 text-center text-red-400">{error}</p>
      ) : (
        <DetailerTable detailers={detailers} onReview={setReviewing} />
      )}

      {reviewing && (
        <VerificationModal
          detailer={reviewing}
          onApprove={() => adminService.verifyDetailer(reviewing.id, 'APPROVED').then(load)}
          onReject={() => adminService.verifyDetailer(reviewing.id, 'REJECTED').then(load)}
          onClose={() => setReviewing(null)}
        />
      )}
    </main>
  );
}

export default AdminDetailers;
