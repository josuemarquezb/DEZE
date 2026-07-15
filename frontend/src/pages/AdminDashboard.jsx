// pages/AdminDashboard.jsx — admin overview: key metrics, pending actions, recent activity.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard.jsx';
import JobTable from '../components/JobTable.jsx';
import VerificationModal from '../components/VerificationModal.jsx';
import * as adminService from '../services/adminService.js';
import { VERIFICATION_STATUS_BADGE_CLASSES } from '../constants/verificationStatus.js';

const QUICK_LINKS = [
  { to: '/admin/detailers', label: 'Manage detailers' },
  { to: '/admin/jobs', label: 'View all jobs' },
  { to: '/admin/revenue', label: 'Revenue' },
];

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewing, setReviewing] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    adminService
      .getDashboardStats()
      .then(setStats)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) {
    return <main className="px-4 py-16 text-center text-zinc-400">Loading dashboard...</main>;
  }

  if (error) {
    return <main className="px-4 py-16 text-center text-red-400">{error}</main>;
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Admin dashboard</h1>
        <div className="flex gap-3 text-sm">
          {QUICK_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="rounded-lg border border-zinc-700 px-3 py-1.5 text-zinc-300 hover:bg-zinc-800">
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total detailers" value={stats.totalDetailers} to="/admin/detailers" />
        <StatCard label="Total customers" value={stats.totalCustomers} />
        <StatCard label="Jobs completed this month" value={stats.jobsCompletedThisMonth} to="/admin/jobs" />
        <StatCard label="Revenue this month" value={`$${stats.revenueThisMonth.total.toLocaleString()}`} to="/admin/revenue" />
        <StatCard
          label="Pending verifications"
          value={stats.pendingVerifications}
          to="/admin/detailers?verificationStatus=PENDING"
          highlight={stats.pendingVerifications > 0}
        />
      </div>

      {stats.pendingDetailers.length > 0 && (
        <div className="mb-10 rounded-xl border border-red-500/30 bg-red-500/5 p-5">
          <h2 className="mb-3 text-lg font-semibold text-white">Pending actions</h2>
          <ul className="divide-y divide-red-500/10">
            {stats.pendingDetailers.map((d) => (
              <li key={d.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <span className="font-medium text-white">
                    {d.firstName} {d.lastName}
                  </span>
                  <span className="ml-2 text-zinc-500">{d.email}</span>
                </div>
                <button onClick={() => setReviewing(d)} className="text-accent hover:underline">
                  Review
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-10">
        <h2 className="mb-3 text-lg font-semibold text-white">Recent jobs</h2>
        <JobTable jobs={stats.recentJobs} />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-white">Recently joined detailers</h2>
        <ul className="divide-y divide-zinc-800 rounded-xl border border-zinc-800">
          {stats.recentDetailers.map((d) => (
            <li key={d.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <Link to={`/admin/detailers/${d.id}`} className="font-medium text-white hover:text-accent hover:underline">
                  {d.firstName} {d.lastName}
                </Link>
                <span className="ml-2 text-zinc-500">{d.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${VERIFICATION_STATUS_BADGE_CLASSES[d.verificationStatus]}`}
                >
                  {d.verificationStatus}
                </span>
                <span className="text-zinc-500">{new Date(d.createdAt).toLocaleDateString()}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

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

export default AdminDashboard;
