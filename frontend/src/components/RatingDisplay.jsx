// components/RatingDisplay.jsx — star rating + review count.

import RatingStars from './RatingStars.jsx';

function RatingDisplay({ rating = 0, totalReviews = 0, size = 'md', showCount = true }) {
  return (
    <div className="flex items-center gap-1.5">
      <RatingStars rating={rating} size={size} />
      <span className="text-sm text-zinc-300">{rating.toFixed(1)}</span>
      {showCount && (
        <span className="text-sm text-zinc-500">
          ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
}

export default RatingDisplay;
