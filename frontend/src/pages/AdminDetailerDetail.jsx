// pages/AdminDetailerDetail.jsx — admin: one detailer's full profile, earnings, and recent jobs.

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import StatCard from '../components/StatCard.jsx';
import JobTable from '../components/JobTable.jsx';
import * as adminService from '../services/adminService.js';
import { SERVICE_TYPE_LABELS } from '../constants/serviceTypes.js';
import { VERIFICATION_STATUS_BADGE_CLASSES } from '../constants/verificationStatus.js';

function AdminDetailerDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    adminService
      .getDetailerEarnings(id)
      .then(setData)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load detailer.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const setVerification = async (status) => {
    setActionError(null);
    setActionLoading(true);
    try {
      await adminService.verifyDetailer(id, status);
      load();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <main className="px-4 py-16 text-center text-zinc-400">Loading detailer...</main>;
  }

  if (error) {
    return <main className="px-4 py-16 text-center text-red-400">{error}</main>;
  }

  const { detailer, earnings, recentJobs } = data;

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {detailer.firstName} {detailer.lastName}
          </h1>
          <p className="text-sm text-zinc-500">{detailer.email}</p>
          {detailer.phone && <p className="text-sm text-zinc-500">{detailer.phone}</p>}
        </div>
        <span
          className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${VERIFICATION_STATUS_BADGE_CLASSES[detailer.verificationStatus]}`}
        >
          {detailer.verificationStatus}
        </span>
      </div>

      {detailer.verificationStatus === 'PENDING' && (
        <div className="mb-8 flex gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4">
          <button
            onClick={() => setVerification('APPROVED')}
            disabled={actionLoading}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-zinc-950 hover:opacity-90 disabled:opacity-50"
          >
            Approve
          </button>
          <button
            onClick={() => setVerification('REJECTED')}
            disabled={actionLoading}
            className="rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      )}
      {actionError && <p className="mb-6 text-sm text-red-400">{actionError}</p>}

      <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-3 text-lg font-semibold text-white">Profile</h2>
        <p className="mb-3 text-zinc-300">{detailer.bio || 'No bio provided.'}</p>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {detailer.serviceTypes.map((type) => (
            <span key={type} className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
              {SERVICE_TYPE_LABELS[type] || type}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm text-zinc-400 sm:grid-cols-4">
          <p>Rating: {detailer.rating.toFixed(1)} ★ ({detailer.totalReviews})</p>
          <p>Years exp.: {detailer.yearsExperience ?? '—'}</p>
          <p>Hourly rate: {detailer.hourlyRate ? `$${detailer.hourlyRate}` : '—'}</p>
          <p>Joined: {new Date(detailer.joinedAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-white">Earnings</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Total earned" value={`$${earnings.totalEarned.toLocaleString()}`} />
          <StatCard label="Total paid out" value={`$${earnings.totalPaidOut.toLocaleString()}`} />
          <StatCard label="Amount owed" value={`$${earnings.amountOwed.toLocaleString()}`} highlight={earnings.amountOwed > 0} />
        </div>

        {earnings.paymentHistory.length > 0 && (
          <div className="mt-4 overflow-hidden rounded-xl border border-zinc-800">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-800 bg-zinc-900 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Scheduled</th>
                  <th className="px-4 py-2">Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {earnings.paymentHistory.map((p, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2">${p.amount ?? 0}</td>
                    <td className="px-4 py-2">{p.status}</td>
                    <td className="px-4 py-2">{p.scheduledAt ? new Date(p.scheduledAt).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-2">{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-white">Recent jobs</h2>
        <JobTable jobs={recentJobs} />
      </div>
    </main>
  );
}

export default AdminDetailerDetail;
