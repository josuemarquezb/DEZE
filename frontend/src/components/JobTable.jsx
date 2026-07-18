// components/JobTable.jsx — table of all platform jobs for admin review.

import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge.jsx';

/**
 * @param {object[]} jobs
 * @param {(job: object) => void} [onMarkCompleted]
 * @param {(job: object) => void} [onDispute]
 */
function JobTable({ jobs, onMarkCompleted, onDispute }) {
  if (!jobs.length) {
    return <p className="py-8 text-center text-sm text-zinc-500">No jobs match these filters.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800">
      <table className="w-full min-w-[980px] text-left text-sm">
        <thead className="border-b border-zinc-800 bg-zinc-900 text-xs uppercase tracking-wide text-zinc-500">
          <tr>
            <th className="px-4 py-3">Job</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Detailer</th>
            <th className="px-4 py-3">Service</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">DEZE Revenue</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {jobs.map((job) => (
            <tr key={job.id} className="text-zinc-300 hover:bg-zinc-900/60">
              <td className="px-4 py-3">
                <Link to={`/jobs/${job.id}`} className="font-medium text-white hover:text-accent hover:underline">
                  {job.jobTitle}
                </Link>
                <p className="text-xs text-zinc-600">{job.id.slice(0, 8)}</p>
              </td>
              <td className="px-4 py-3 text-zinc-400">{job.customerName || '—'}</td>
              <td className="px-4 py-3 text-zinc-400">{job.detailerName || '—'}</td>
              <td className="px-4 py-3">{job.serviceType}</td>
              <td className="px-4 py-3">
                <StatusBadge status={job.status} />
              </td>
              <td className="px-4 py-3 text-zinc-500">{new Date(job.requestedDate).toLocaleDateString()}</td>
              <td className="px-4 py-3 text-accent">
                {job.agreedPrice != null ? `$${job.agreedPrice}` : job.budget != null ? `$${job.budget} (budget)` : '—'}
              </td>
              <td className="px-4 py-3 text-zinc-400">{job.dezeRevenue != null ? `$${job.dezeRevenue.toFixed(2)}` : '—'}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {job.status === 'IN_PROGRESS' && onMarkCompleted && (
                    <button onClick={() => onMarkCompleted(job)} className="text-accent hover:underline">
                      Mark completed
                    </button>
                  )}
                  {['COMPLETED', 'IN_PROGRESS'].includes(job.status) && onDispute && (
                    <button onClick={() => onDispute(job)} className="text-red-400 hover:underline">
                      Dispute
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default JobTable;
