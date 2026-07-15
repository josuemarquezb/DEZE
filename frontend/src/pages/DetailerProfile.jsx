// pages/DetailerProfile.jsx — public profile view for a single detailer.
// Deliberately omits email/phone (see backend controllers/detailers.controller.js
// toPublicDetailer / toPublicReview — those fields are never sent to this page).

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import RatingDisplay from '../components/RatingDisplay.jsx';
import RatingBreakdown from '../components/RatingBreakdown.jsx';
import ReviewList from '../components/ReviewList.jsx';
import PhotoGallery from '../components/PhotoGallery.jsx';
import * as detailerService from '../services/detailerService.js';
import * as reviewService from '../services/reviewService.js';
import { toAssetUrl } from '../services/api.js';
import { SERVICE_TYPE_LABELS } from '../constants/serviceTypes.js';

function DetailerProfile() {
  const { id } = useParams();
  const [detailer, setDetailer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([detailerService.getProfile(id), reviewService.getDetailerReviews(id), reviewService.getReviewStats(id)])
      .then(([profileData, reviewsData, statsData]) => {
        setDetailer(profileData.detailer);
        setReviews(reviewsData);
        setStats(statsData);
      })
      .catch((err) => setError(err.response?.data?.message || 'Detailer not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <main className="px-4 py-16 text-center text-zinc-400">Loading profile...</main>;
  }

  if (error) {
    return <main className="px-4 py-16 text-center text-red-400">{error}</main>;
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="flex items-start gap-5">
        {detailer.profilePhoto ? (
          <img src={toAssetUrl(detailer.profilePhoto)} alt={detailer.firstName} className="h-20 w-20 rounded-full border border-zinc-800 object-cover" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-zinc-800 bg-zinc-800 text-2xl font-semibold text-zinc-300">
            {detailer.firstName[0]}
            {detailer.lastName[0]}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-white">
            {detailer.firstName} {detailer.lastName}
          </h1>
          <RatingDisplay rating={detailer.rating} totalReviews={detailer.totalReviews} size="lg" />
          {detailer.verificationStatus === 'APPROVED' && (
            <span className="mt-1 inline-block rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-xs text-accent">
              Verified
            </span>
          )}
        </div>
      </div>

      <p className="mt-6 text-zinc-300">{detailer.bio || 'This detailer hasn\'t added a bio yet.'}</p>

      <div className="mt-4 flex flex-wrap gap-3 text-sm text-zinc-400">
        {detailer.yearsExperience != null && <span>{detailer.yearsExperience} years experience</span>}
        {detailer.hourlyRate != null && <span className="text-accent">${detailer.hourlyRate}/hr</span>}
        <span>Services within {detailer.serviceAreaRadius} mi</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {detailer.serviceTypes.map((type) => (
          <span key={type} className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
            {SERVICE_TYPE_LABELS[type] || type}
          </span>
        ))}
      </div>

      {detailer.equipmentPhotos.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-2 text-lg font-semibold text-white">Equipment</h2>
          <PhotoGallery photos={detailer.equipmentPhotos} />
        </div>
      )}

      <div className="mt-8 flex gap-3">
        <button
          disabled
          title="Job posting isn't available yet"
          className="rounded-lg bg-accent px-5 py-2 font-medium text-zinc-950 opacity-50"
        >
          Post Job For This Detailer
        </button>
        <button
          disabled
          title="Messaging isn't available yet"
          className="rounded-lg border border-zinc-700 px-5 py-2 font-medium text-zinc-300 opacity-50"
        >
          Contact Detailer
        </button>
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-lg font-semibold text-white">Reviews</h2>
        {stats && <RatingBreakdown stats={stats} />}
        <div className="mt-6">
          <ReviewList reviews={reviews} />
        </div>
      </div>
    </main>
  );
}

export default DetailerProfile;
