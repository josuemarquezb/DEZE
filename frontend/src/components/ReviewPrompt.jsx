// components/ReviewPrompt.jsx — shown on JobDetail to the owning customer
// once a job is COMPLETED, linking to /jobs/:id/review.

import { Link } from 'react-router-dom';

function ReviewPrompt({ job }) {
  if (job.status !== 'COMPLETED') return null;

  return (
    <div className="mt-6 rounded-xl border border-accent/30 bg-accent/10 p-4">
      <p className="text-sm text-white">How was your service with {job.detailer?.firstName}?</p>
      <Link
        to={`/jobs/${job.id}/review`}
        className="mt-3 inline-block rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-zinc-950 hover:opacity-90"
      >
        Leave a review
      </Link>
    </div>
  );
}

export default ReviewPrompt;
