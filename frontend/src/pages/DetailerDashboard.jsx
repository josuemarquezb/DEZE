// pages/DetailerDashboard.jsx — the authenticated detailer's own profile + stats.

import { useEffect, useState } from 'react';
import ProfileForm from '../components/ProfileForm.jsx';
import PhotoUpload from '../components/PhotoUpload.jsx';
import PhotoGallery from '../components/PhotoGallery.jsx';
import RatingDisplay from '../components/RatingDisplay.jsx';
import * as detailerService from '../services/detailerService.js';
import * as photoService from '../services/photoService.js';
import { SERVICE_TYPE_LABELS } from '../constants/serviceTypes.js';

const VERIFICATION_BADGE = {
  PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  APPROVED: 'bg-accent/10 text-accent border-accent/30',
  REJECTED: 'bg-red-500/10 text-red-400 border-red-500/30',
};

function DetailerDashboard() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileData, statsData] = await Promise.all([
        detailerService.getMyProfile(),
        detailerService.getMyStats(),
      ]);
      setProfile(profileData);
      setStats(statsData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (data) => {
    const updated = await detailerService.updateProfile(data);
    setProfile(updated);
    setEditing(false);
  };

  const refreshProfile = () => detailerService.getMyProfile().then(setProfile);

  const handleRemoveProfilePhoto = async () => {
    if (!window.confirm('Remove your profile photo?')) return;
    await photoService.deletePhoto(profile.profilePhoto);
    refreshProfile();
  };

  const handleSubmitVerification = async () => {
    setVerifyMessage(null);
    try {
      await detailerService.submitVerification();
      setVerifyMessage('Submitted for review.');
      load();
    } catch (err) {
      setVerifyMessage(err.response?.data?.message || 'Failed to submit for verification.');
    }
  };

  if (loading) {
    return <main className="px-4 py-16 text-center text-zinc-400">Loading your dashboard...</main>;
  }

  if (error) {
    return <main className="px-4 py-16 text-center text-red-400">{error}</main>;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Your dashboard</h1>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-medium ${VERIFICATION_BADGE[profile.verificationStatus]}`}
        >
          {profile.verificationStatus}
        </span>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-2xl font-bold text-white">{stats.totalJobsCompleted}</p>
          <p className="text-sm text-zinc-500">Jobs completed</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-2xl font-bold text-white">{stats.averageRating.toFixed(1)}</p>
          <p className="text-sm text-zinc-500">Avg. rating ({stats.totalReviews})</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-2xl font-bold text-white">${stats.totalEarnings.toFixed(2)}</p>
          <p className="text-sm text-zinc-500">Earnings</p>
        </div>
      </div>

      {profile.verificationStatus !== 'APPROVED' && (
        <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-sm text-zinc-300">
            {profile.verificationStatus === 'PENDING'
              ? 'Your verification is under review.'
              : 'Your last verification submission was rejected. You can resubmit below.'}
          </p>
          <button
            onClick={handleSubmitVerification}
            className="mt-3 rounded-lg border border-zinc-700 px-4 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
          >
            {profile.verificationStatus === 'REJECTED' ? 'Resubmit for verification' : 'Submit for verification'}
          </button>
          {verifyMessage && <p className="mt-2 text-sm text-zinc-400">{verifyMessage}</p>}
        </div>
      )}

      {/* Profile */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Profile</h2>
          {!editing && (
            <button onClick={() => setEditing(true)} className="text-sm text-accent hover:underline">
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <ProfileForm initialValues={profile} onSubmit={handleSave} onCancel={() => setEditing(false)} />
        ) : (
          <div className="space-y-4">
            <RatingDisplay rating={profile.rating} totalReviews={profile.totalReviews} />
            <p className="text-zinc-300">{profile.bio || 'No bio yet.'}</p>
            <div className="flex flex-wrap gap-1.5">
              {profile.serviceTypes.map((type) => (
                <span key={type} className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
                  {SERVICE_TYPE_LABELS[type] || type}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm text-zinc-400 sm:grid-cols-3">
              <p>Years experience: {profile.yearsExperience ?? '—'}</p>
              <p>Hourly rate: {profile.hourlyRate ? `$${profile.hourlyRate}` : '—'}</p>
              <p>Service radius: {profile.serviceAreaRadius} mi</p>
            </div>
          </div>
        )}
      </div>

      {/* Profile photo */}
      <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Profile photo</h2>
          {profile.profilePhoto && (
            <button onClick={handleRemoveProfilePhoto} className="text-sm text-red-400 hover:underline">
              Remove
            </button>
          )}
        </div>
        <PhotoUpload
          currentPhotoUrl={profile.profilePhoto}
          onUpload={(file, onProgress) => photoService.uploadProfilePhoto(file, onProgress)}
          onUploaded={refreshProfile}
        />
      </div>

      {/* Equipment photos */}
      <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-3 text-xl font-semibold text-white">Equipment photos</h2>
        <PhotoUpload
          multiple
          onUpload={(file, onProgress) => photoService.uploadEquipmentPhoto(file, onProgress)}
          onUploaded={refreshProfile}
        />
        <div className="mt-4">
          <PhotoGallery
            photos={profile.equipmentPhotos}
            emptyText="No equipment photos yet."
            onDelete={(url) => photoService.deletePhoto(url).then(refreshProfile)}
          />
        </div>
      </div>

      {/* Verification documents */}
      <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-3 text-xl font-semibold text-white">Verification documents</h2>
        <p className="mb-3 text-sm text-zinc-500">
          Upload proof of insurance, licensing, or ID so our team can verify your account.
        </p>
        <PhotoUpload
          multiple
          onUpload={(file, onProgress) => photoService.uploadVerificationDoc(file, onProgress)}
          onUploaded={refreshProfile}
        />
        <div className="mt-4">
          <PhotoGallery
            photos={profile.verificationDocs}
            emptyText="No verification documents uploaded yet."
            onDelete={(url) => photoService.deletePhoto(url).then(refreshProfile)}
          />
        </div>
      </div>
    </main>
  );
}

export default DetailerDashboard;
