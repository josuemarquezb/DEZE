// components/StatusBadge.jsx — colored pill showing a DetailJob's status.

import { JOB_STATUS_LABELS, JOB_STATUS_BADGE_CLASSES } from '../constants/jobStatus.js';

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${JOB_STATUS_BADGE_CLASSES[status] || 'border-zinc-700 bg-zinc-800 text-zinc-300'}`}
    >
      {JOB_STATUS_LABELS[status] || status}
    </span>
  );
}

export default StatusBadge;
