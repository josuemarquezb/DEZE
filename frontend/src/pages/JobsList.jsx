// pages/JobsList.jsx — detailer browses nearby open jobs.
// Tries the browser's current location first; falls back to the detailer's
// saved profile location (handled server-side) if permission is denied.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import JobList from '../components/JobList.jsx';
import * as jobService from '../services/jobService.js';
import { getCurrentLocation } from '../services/locationService.js';

function JobsList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationNote, setLocationNote] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      let coords;
      try {
        coords = await getCurrentLocation();
      } catch {
        setLocationNote('Using your saved profile location — enable location access for more accurate results.');
      }
      const results = await jobService.getNearbyJobs(coords?.latitude, coords?.longitude);
      setJobs(results);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load nearby jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <main className="px-4 py-16 text-center text-zinc-400">Finding jobs near you...</main>;
  }

  if (error) {
    return <main className="px-4 py-16 text-center text-red-400">{error}</main>;
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Jobs near you</h1>
        <Link
          to="/jobs/map"
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
        >
          Map view
        </Link>
      </div>
      {locationNote && <p className="mb-6 text-sm text-zinc-500">{locationNote}</p>}
      <JobList jobs={jobs} emptyMessage="No open jobs nearby right now — check back soon." />
    </main>
  );
}

export default JobsList;
