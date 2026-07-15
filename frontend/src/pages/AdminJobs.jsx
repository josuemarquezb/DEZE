// pages/AdminJobs.jsx — admin: browse/filter/sort all platform jobs, mark
// in-progress jobs completed, and resolve payment disputes.

import { useEffect, useState } from 'react';
import JobTable from '../components/JobTable.jsx';
import * as adminService from '../services/adminService.js';
import * as jobService from '../services/jobService.js';
import { JOB_STATUSES } from '../constants/jobStatus.js';

const SORT_OPTIONS = [
  { value: 'date', label: 'Date' },
  { value: 'amount', label: 'Amount' },
  { value: 'status', label: 'Status' },
];

const DISPUTE_RESOLUTIONS = [
  { value: 'REFUND_CUSTOMER', label: 'Refund the customer' },
  { value: 'RELEASE_TO_DETAILER', label: 'Release payment to detailer' },
  { value: 'CANCEL_JOB', label: 'Cancel the job' },
];

/** Small inline modal for resolving a dispute — not broken out to its own file since it's a single-use form. */
function DisputeModal({ job, onResolve, onClose }) {
  const [resolution, setResolution] = useState(DISPUTE_RESOLUTIONS[0].value);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await onResolve(job.id, resolution, notes);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resolve dispute.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-1 text-lg font-semibold text-white">Resolve dispute</h2>
        <p className="mb-4 text-sm text-zinc-500">{job.jobTitle}</p>

        <label className="mb-1 block text-sm font-medium text-zinc-300">Resolution</label>
        <select
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          className="mb-4 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:border-accent focus:outline-none"
        >
          {DISPUTE_RESOLUTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <label className="mb-1 block text-sm font-medium text-zinc-300">Notes (optional)</label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mb-4 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-white placeholder-zinc-600 focus:border-accent focus:outline-none"
          placeholder="What happened, and why this resolution..."
        />

        {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={submit}
            disabled={submitting}
            className="flex-1 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-zinc-950 hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? 'Resolving...' : 'Resolve'}
          </button>
          <button onClick={onClose} className="flex-1 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [disputing, setDisputing] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    adminService
      .getAllJobs({ status: status || undefined, sortBy, sortDir })
      .then((data) => {
        setJobs(data.jobs);
        setTotal(data.total);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load jobs.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [status, sortBy, sortDir]);

  const markCompleted = async (job) => {
    await jobService.updateJobStatus(job.id, 'COMPLETED');
    load();
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">All jobs</h1>
        <p className="text-sm text-zinc-500">{total} total</p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-white focus:border-accent focus:outline-none"
        >
          <option value="">All statuses</option>
          {JOB_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-white focus:border-accent focus:outline-none"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Sort by {opt.label}
            </option>
          ))}
        </select>

        <button
          onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
        >
          {sortDir === 'asc' ? 'Ascending ↑' : 'Descending ↓'}
        </button>
      </div>

      {loading ? (
        <p className="py-8 text-center text-zinc-400">Loading jobs...</p>
      ) : error ? (
        <p className="py-8 text-center text-red-400">{error}</p>
      ) : (
        <JobTable jobs={jobs} onMarkCompleted={markCompleted} onDispute={setDisputing} />
      )}

      {disputing && (
        <DisputeModal
          job={disputing}
          onResolve={(jobId, resolution, notes) => adminService.handleDispute(jobId, resolution, notes).then(load)}
          onClose={() => setDisputing(null)}
        />
      )}
    </main>
  );
}

export default AdminJobs;
