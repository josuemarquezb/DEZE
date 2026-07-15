// components/RatingStars.jsx — read-only 1-5 star rating display.

function RatingStars({ rating = 0, size = 'md' }) {
  const rounded = Math.round(rating);
  const starSize = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-sm' : 'text-base';

  return (
    <span className={`${starSize} leading-none tracking-tight`} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rounded ? 'text-accent' : 'text-zinc-700'}>
          ★
        </span>
      ))}
    </span>
  );
}

export default RatingStars;
