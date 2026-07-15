// pages/DetailerJobs.jsx — jobs the detailer has accepted, across all statuses.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import JobList from '../components/JobList.jsx';
import * as jobService from '../services/jobService.js';

function DetailerJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    jobService
      .getMyAcceptedJobs()
      .then(setJobs)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load your jobs.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <main className="px-4 py-16 text-center text-zinc-400">Loading your jobs...</main>;
  }

  if (error) {
    return <main className="px-4 py-16 text-center text-red-400">{error}</main>;
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Your accepted jobs</h1>
        <Link to="/jobs" className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-zinc-950 hover:opacity-90">
          Browse nearby jobs
        </Link>
      </div>
      <JobList jobs={jobs} showStatus emptyMessage="You haven't accepted any jobs yet." />
    </main>
  );
}

export default DetailerJobs;
