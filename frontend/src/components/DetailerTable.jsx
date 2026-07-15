// components/DetailerTable.jsx — table of detailers for admin review/management.

import { Link } from 'react-router-dom';
import { VERIFICATION_STATUS_BADGE_CLASSES } from '../constants/verificationStatus.js';

/** @param {object[]} detailers @param {(detailer: object) => void} onReview - opens VerificationModal for a PENDING detailer */
function DetailerTable({ detailers, onReview }) {
  if (!detailers.length) {
    return <p className="py-8 text-center text-sm text-zinc-500">No detailers match these filters.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-zinc-800 bg-zinc-900 text-xs uppercase tracking-wide text-zinc-500">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Rating</th>
            <th className="px-4 py-3">Jobs</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Joined</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {detailers.map((d) => (
            <tr key={d.id} className="text-zinc-300 hover:bg-zinc-900/60">
              <td className="px-4 py-3 font-medium text-white">
                {d.firstName} {d.lastName}
              </td>
              <td className="px-4 py-3 text-zinc-400">{d.email}</td>
              <td className="px-4 py-3">
                {d.rating.toFixed(1)} ★ <span className="text-zinc-500">({d.totalReviews})</span>
              </td>
              <td className="px-4 py-3">{d.totalJobsCompleted}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${VERIFICATION_STATUS_BADGE_CLASSES[d.verificationStatus]}`}
                >
                  {d.verificationStatus}
                </span>
              </td>
              <td className="px-4 py-3 text-zinc-500">{new Date(d.joinedAt).toLocaleDateString()}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {d.verificationStatus === 'PENDING' && (
                    <button onClick={() => onReview(d)} className="text-accent hover:underline">
                      Review
                    </button>
                  )}
                  <Link to={`/admin/detailers/${d.id}`} className="text-zinc-400 hover:text-white hover:underline">
                    View
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DetailerTable;
