// components/ReviewList.jsx — all reviews for a detailer.

import ReviewCard from './ReviewCard.jsx';

function ReviewList({ reviews, emptyMessage = 'No reviews yet.' }) {
  if (reviews.length === 0) {
    return <p className="text-sm text-zinc-500">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}

export default ReviewList;
