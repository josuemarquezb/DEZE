// components/ReviewForm.jsx — 1-5 star selector + optional comment, used by LeaveReview.jsx.

import { useState } from 'react';

const MAX_COMMENT_LENGTH = 500;

function ReviewForm({ onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const displayRating = hoverRating || rating;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!rating) {
      setError('Select a rating');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ rating, comment: comment.trim() || undefined });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post review. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <div className="flex gap-1 text-4xl" onMouseLeave={() => setHoverRating(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onMouseEnter={() => setHoverRating(n)}
              onClick={() => setRating(n)}
              aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
              className={`leading-none transition-colors ${n <= displayRating ? 'text-accent' : 'text-zinc-700 hover:text-zinc-600'}`}
            >
              ★
            </button>
          ))}
        </div>
        <p className="mt-1 text-sm text-zinc-400">{rating > 0 ? `You rated ${rating} out of 5` : 'Tap a star to rate'}</p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-300">Comment (optional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT_LENGTH))}
          rows={4}
          maxLength={MAX_COMMENT_LENGTH}
          placeholder="How was your experience?"
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-600 focus:border-accent focus:outline-none"
        />
        <p className="mt-1 text-right text-xs text-zinc-500">
          {comment.length}/{MAX_COMMENT_LENGTH}
        </p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={!rating || submitting}
        className="rounded-lg bg-accent px-5 py-2 font-medium text-zinc-950 transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? 'Posting...' : 'Post Review'}
      </button>
    </form>
  );
}

export default ReviewForm;
