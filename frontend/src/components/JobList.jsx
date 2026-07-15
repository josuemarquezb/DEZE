// components/JobList.jsx — filterable/sortable list of JobCards.
// Filtering/sorting happens client-side over whatever `jobs` array is passed
// in (the caller is responsible for fetching — nearby, search, my-requests, etc).

import { useMemo, useState } from 'react';
import JobCard from './JobCard.jsx';
import { SERVICE_TYPES, SERVICE_TYPE_LABELS } from '../constants/serviceTypes.js';

const SORT_OPTIONS = [
  { value: 'distance', label: 'Distance' },
  { value: 'budget', label: 'Budget' },
  { value: 'date', label: 'Requested date' },
];

function JobList({ jobs, showStatus = false, emptyMessage = 'No jobs found.' }) {
  const [serviceType, setServiceType] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [maxDistance, setMaxDistance] = useState('');
  const [sortBy, setSortBy] = useState('distance');

  const hasDistance = jobs.some((job) => typeof job.distanceMiles === 'number');

  const filtered = useMemo(() => {
    let result = jobs;
    if (serviceType) result = result.filter((job) => job.serviceType === serviceType);
    if (maxBudget !== '') result = result.filter((job) => job.budget <= Number(maxBudget));
    if (maxDistance !== '') {
      result = result.filter((job) => typeof job.distanceMiles !== 'number' || job.distanceMiles <= Number(maxDistance));
    }

    const sorted = [...result];
    if (sortBy === 'distance' && hasDistance) {
      sorted.sort((a, b) => (a.distanceMiles ?? Infinity) - (b.distanceMiles ?? Infinity));
    } else if (sortBy === 'budget') {
      sorted.sort((a, b) => b.budget - a.budget);
    } else if (sortBy === 'date') {
      sorted.sort((a, b) => new Date(a.requestedDate) - new Date(b.requestedDate));
    }
    return sorted;
  }, [jobs, serviceType, maxBudget, maxDistance, sortBy, hasDistance]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400">Service type</label>
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-white focus:border-accent focus:outline-none"
          >
            <option value="">All services</option>
            {SERVICE_TYPES.map((type) => (
              <option key={type} value={type}>
                {SERVICE_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400">Max budget ($)</label>
          <input
            type="number"
            min="0"
            value={maxBudget}
            onChange={(e) => setMaxBudget(e.target.value)}
            placeholder="Any"
            className="w-24 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-white placeholder-zinc-600 focus:border-accent focus:outline-none"
          />
        </div>

        {hasDistance && (
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Max distance (mi)</label>
            <input
              type="number"
              min="0"
              value={maxDistance}
              onChange={(e) => setMaxDistance(e.target.value)}
              placeholder="Any"
              className="w-24 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-white placeholder-zinc-600 focus:border-accent focus:outline-none"
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400">Sort by</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-white focus:border-accent focus:outline-none"
          >
            {SORT_OPTIONS.filter((opt) => opt.value !== 'distance' || hasDistance).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-zinc-500">{emptyMessage}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} showStatus={showStatus} />
          ))}
        </div>
      )}
    </div>
  );
}

export default JobList;
