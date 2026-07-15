// components/ReviewCard.jsx — a single review (name, rating, comment, date).
// Every review returned by the API comes from a customer who completed a job
// with this detailer (see backend/controllers/reviews.controller.js), so the
// "Verified purchase" badge always applies — no extra data needed for it.

import RatingStars from './RatingStars.jsx';

const TIME_UNITS = [
  ['year', 31536000],
  ['month', 2592000],
  ['week', 604800],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
];

const timeAgo = (dateString) => {
  const diffSec = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  for (const [label, secs] of TIME_UNITS) {
    const value = Math.floor(diffSec / secs);
    if (value >= 1) return `${value} ${label}${value > 1 ? 's' : ''} ago`;
  }
  return 'just now';
};

function ReviewCard({ review }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-white">
            {review.customerFirstName} {review.customerLastInitial ? `${review.customerLastInitial}.` : ''}
          </p>
          <div className="mt-0.5 flex items-center gap-2">
            <RatingStars rating={review.rating} />
            <span className="text-xs text-zinc-500">{timeAgo(review.createdAt)}</span>
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-xs text-accent">
          Verified purchase
        </span>
      </div>
      {review.comment && <p className="mt-3 text-sm text-zinc-300">{review.comment}</p>}
    </div>
  );
}

export default ReviewCard;
