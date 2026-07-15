// pages/AdminRevenue.jsx — admin: platform revenue breakdown, monthly trend, detailer payouts.

import { useEffect, useState } from 'react';
import StatCard from '../components/StatCard.jsx';
import RevenueChart from '../components/RevenueChart.jsx';
import * as adminService from '../services/adminService.js';

function AdminRevenue() {
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminService
      .getRevenue()
      .then(setRevenue)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load revenue.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <main className="px-4 py-16 text-center text-zinc-400">Loading revenue...</main>;
  }

  if (error) {
    return <main className="px-4 py-16 text-center text-red-400">{error}</main>;
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold text-white">Revenue</h1>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="All-time revenue" value={`$${revenue.allTime.total.toLocaleString()}`} />
        <StatCard label="This month" value={`$${revenue.thisMonth.total.toLocaleString()}`} />
        <StatCard label="Job revenue (all-time)" value={`$${revenue.allTime.jobRevenue.toLocaleString()}`} />
        <StatCard
          label="Subscription revenue (MRR)"
          value={`$${revenue.allTime.subscriptionRevenue.toLocaleString()}`}
          sublabel={`${revenue.activeSubscriptions} active subscriptions`}
        />
      </div>

      <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Revenue by month</h2>
        <RevenueChart data={revenue.monthly} />
        <p className="mt-3 text-xs text-zinc-600">
          Subscription revenue reflects current active subscriptions × $75/month applied across the chart, since billing
          history isn't tracked yet. Job revenue is computed from actual completed, paid jobs per month.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Detailer payouts</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Total owed to detailers" value={`$${revenue.payouts.totalOwed.toLocaleString()}`} highlight={revenue.payouts.totalOwed > 0} />
          <StatCard label="Total already paid out" value={`$${revenue.payouts.totalPaidOut.toLocaleString()}`} />
          <StatCard
            label="Next payout date"
            value={revenue.payouts.nextPayoutDate ? new Date(revenue.payouts.nextPayoutDate).toLocaleDateString() : '—'}
          />
        </div>
      </div>
    </main>
  );
}

export default AdminRevenue;
