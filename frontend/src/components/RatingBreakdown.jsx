// components/RatingBreakdown.jsx — average rating + 1-5 star count bars.
// `stats` is the shape returned by GET /reviews/:detailerId/stats.

function RatingBreakdown({ stats }) {
  const { averageRating, totalReviews, breakdown } = stats;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-white">{averageRating.toFixed(1)}</span>
        <span className="text-zinc-500">/ 5</span>
      </div>
      <p className="mb-4 text-sm text-zinc-500">
        {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
      </p>

      <div className="space-y-1.5">
        {[5, 4, 3, 2, 1].map((n) => {
          const count = breakdown[n] || 0;
          const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
          return (
            <div key={n} className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="w-8 shrink-0">{n} ★</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-800">
                <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
              </div>
              <span className="w-6 shrink-0 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RatingBreakdown;
