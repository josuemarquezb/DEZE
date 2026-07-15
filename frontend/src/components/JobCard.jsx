// components/JobCard.jsx — job preview card used across JobsList, CustomerJobs,
// and DetailerJobs. Shows customer initials (never full contact info), vehicle,
// service, budget, and — when available — distance and/or status.

import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge.jsx';
import { toAssetUrl } from '../services/api.js';
import { SERVICE_TYPE_LABELS } from '../constants/serviceTypes.js';

function JobCard({ job, showStatus = false }) {
  const initials = `${job.customer?.firstName?.[0] || ''}${job.customer?.lastName?.[0] || ''}`;
  const thumbnail = job.photosAfter?.[0] || job.photosBefore?.[0];

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="block rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:border-accent/60"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-zinc-800 text-sm font-semibold text-zinc-300">
            {initials || '?'}
          </div>
          <div>
            <h3 className="font-semibold text-white">{job.jobTitle}</h3>
            <p className="text-sm text-zinc-400">
              {job.vehicleYear} {job.vehicleMake} {job.vehicleModel}
            </p>
          </div>
        </div>
        {showStatus && <StatusBadge status={job.status} />}
      </div>

      {thumbnail && <img src={toAssetUrl(thumbnail)} alt="" className="mt-3 h-28 w-full rounded-lg object-cover" />}

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
        <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-zinc-300">
          {SERVICE_TYPE_LABELS[job.serviceType] || job.serviceType}
        </span>
        <span className="text-accent">${job.budget}</span>
        {typeof job.distanceMiles === 'number' && <span>{job.distanceMiles} mi away</span>}
        <span>{new Date(job.requestedDate).toLocaleDateString()}</span>
      </div>
    </Link>
  );
}

export default JobCard;
