// components/DetailerCard.jsx — summary card for a detailer in search/nearby results.

import { Link } from 'react-router-dom';
import RatingDisplay from './RatingDisplay.jsx';
import { toAssetUrl } from '../services/api.js';
import { SERVICE_TYPE_LABELS } from '../constants/serviceTypes.js';

function DetailerCard({ detailer }) {
  return (
    <Link
      to={`/detailer/${detailer.id}`}
      className="block rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:border-accent/60"
    >
      <div className="flex items-start gap-4">
        {detailer.profilePhoto ? (
          <img
            src={toAssetUrl(detailer.profilePhoto)}
            alt={detailer.firstName}
            className="h-14 w-14 shrink-0 rounded-full border border-zinc-800 object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-zinc-800 text-lg font-semibold text-zinc-300">
            {detailer.firstName?.[0]}
            {detailer.lastName?.[0]}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate font-semibold text-white">
              {detailer.firstName} {detailer.lastName}
            </h3>
            {typeof detailer.distanceMiles === 'number' && (
              <span className="shrink-0 text-xs text-zinc-500">{detailer.distanceMiles} mi</span>
            )}
          </div>
          <RatingDisplay rating={detailer.rating} totalReviews={detailer.totalReviews} />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {detailer.serviceTypes.map((type) => (
              <span
                key={type}
                className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300"
              >
                {SERVICE_TYPE_LABELS[type] || type}
              </span>
            ))}
          </div>
          {detailer.hourlyRate && (
            <p className="mt-2 text-sm text-accent">${detailer.hourlyRate}/hr</p>
          )}
        </div>
      </div>
    </Link>
  );
}

export default DetailerCard;
