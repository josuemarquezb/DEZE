// pages/JobDetail.jsx — full job details, with role-appropriate actions:
// detailers browsing can accept/decline/propose a price; the owning customer
// sees who accepted and can cancel; the assigned detailer can advance status.

import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge.jsx';
import PriceNegotiation from '../components/PriceNegotiation.jsx';
import ReviewPrompt from '../components/ReviewPrompt.jsx';
import PhotoUpload from '../components/PhotoUpload.jsx';
import PhotoGallery from '../components/PhotoGallery.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import * as jobService from '../services/jobService.js';
import * as photoService from '../services/photoService.js';
import * as notificationService from '../services/notificationService.js';
import { SERVICE_TYPE_LABELS } from '../constants/serviceTypes.js';

function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await jobService.getJobById(id);
      setJob(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Job not found');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
    notificationService.markJobNotificationsAsRead(id).catch(() => {});
  }, [id, load]);

  const runAction = async (action) => {
    setActionError(null);
    setActionLoading(true);
    try {
      const updated = await action();
      setJob(updated);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Action failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <main className="px-4 py-16 text-center text-zinc-400">Loading job...</main>;
  }

  if (error) {
    return <main className="px-4 py-16 text-center text-red-400">{error}</main>;
  }

  const isOwner = user?.userType === 'CUSTOMER' && job.customer?.userId === user.id;
  const isAssignedDetailer = user?.userType === 'DETAILER' && job.detailer?.userId === user.id;
  const isBrowsingDetailer = user?.userType === 'DETAILER' && job.status === 'REQUESTED' && !job.detailer;

  const canAccept = isBrowsingDetailer;
  const canDecline = isBrowsingDetailer || (isAssignedDetailer && job.status === 'ACCEPTED');
  const canProposePrice = isAssignedDetailer && ['ACCEPTED', 'IN_PROGRESS'].includes(job.status);
  const canStart = isAssignedDetailer && job.status === 'ACCEPTED';
  const canComplete = isAssignedDetailer && job.status === 'IN_PROGRESS';
  const canCancel =
    (isOwner && ['REQUESTED', 'ACCEPTED'].includes(job.status)) || (isAssignedDetailer && job.status === 'ACCEPTED');

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">{job.jobTitle}</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Posted by {job.customer?.firstName} {job.customer?.lastName?.[0]}.
          </p>
        </div>
        <StatusBadge status={job.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="mb-2 text-sm font-semibold text-zinc-300">Vehicle</h2>
          <p className="text-white">
            {job.vehicleYear} {job.vehicleMake} {job.vehicleModel}
          </p>
          <p className="text-sm text-zinc-400">
            {job.vehicleType}
            {job.vehicleColor ? ` · ${job.vehicleColor}` : ''}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="mb-2 text-sm font-semibold text-zinc-300">Service</h2>
          <p className="text-white">{SERVICE_TYPE_LABELS[job.serviceType] || job.serviceType}</p>
          <p className="text-sm text-accent">Budget: ${job.budget}</p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="mb-2 text-sm font-semibold text-zinc-300">Location</h2>
          <p className="text-white">{job.locationAddress}</p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="mb-2 text-sm font-semibold text-zinc-300">Requested time</h2>
          <p className="text-white">{new Date(job.requestedDate).toLocaleDateString()}</p>
          <p className="text-sm text-zinc-400">
            {job.requestedTimeStart} – {job.requestedTimeEnd}
          </p>
        </div>
      </div>

      {job.description && (
        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="mb-2 text-sm font-semibold text-zinc-300">Special notes</h2>
          <p className="whitespace-pre-wrap text-zinc-300">{job.description}</p>
        </div>
      )}

      {job.detailer && (
        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="mb-2 text-sm font-semibold text-zinc-300">Detailer</h2>
          <p className="text-white">
            {job.detailer.firstName} {job.detailer.lastName}
          </p>
          <p className="text-sm text-zinc-400">
            {job.detailer.rating.toFixed(1)} ★ ({job.detailer.totalReviews} reviews)
          </p>
          {(isOwner || isAssignedDetailer) && job.status !== 'CANCELLED' && (
            <Link
              to={`/jobs/${job.id}/chat`}
              className="mt-3 inline-block rounded-lg border border-zinc-700 px-4 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              Message {isOwner ? job.detailer.firstName : job.customer.firstName}
            </Link>
          )}
        </div>
      )}

      {isOwner && <ReviewPrompt job={job} />}

      {(job.status === 'COMPLETED' || job.photosBefore.length > 0 || job.photosAfter.length > 0) && (
        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="mb-3 text-sm font-semibold text-zinc-300">Before / after photos</h2>

          {isOwner && job.status === 'COMPLETED' && (
            <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">Before</p>
                <PhotoUpload
                  multiple
                  onUpload={(file, onProgress) => photoService.uploadJobPhoto(job.id, file, 'before', onProgress)}
                  onUploaded={load}
                />
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">After</p>
                <PhotoUpload
                  multiple
                  onUpload={(file, onProgress) => photoService.uploadJobPhoto(job.id, file, 'after', onProgress)}
                  onUploaded={load}
                />
              </div>
            </div>
          )}

          {(job.photosBefore.length > 0 || job.photosAfter.length > 0) && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">Before</p>
                <PhotoGallery
                  photos={job.photosBefore}
                  emptyText="No before photos yet."
                  onDelete={isOwner ? (url) => photoService.deletePhoto(url).then(load) : undefined}
                />
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">After</p>
                <PhotoGallery
                  photos={job.photosAfter}
                  emptyText="No after photos yet."
                  onDelete={isOwner ? (url) => photoService.deletePhoto(url).then(load) : undefined}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {(canProposePrice || job.agreedPrice != null) && (
        <div className="mt-6">
          <PriceNegotiation
            job={job}
            canPropose={canProposePrice}
            onPropose={(price) => jobService.proposePrice(job.id, price).then((updated) => setJob(updated))}
            viewerRole={isOwner ? 'CUSTOMER' : isAssignedDetailer ? 'DETAILER' : null}
          />
        </div>
      )}

      {actionError && <p className="mt-6 text-sm text-red-400">{actionError}</p>}

      <div className="mt-8 flex flex-wrap gap-3">
        {canAccept && (
          <button
            onClick={() => runAction(() => jobService.acceptJob(job.id))}
            disabled={actionLoading}
            className="rounded-lg bg-accent px-5 py-2 font-medium text-zinc-950 hover:opacity-90 disabled:opacity-50"
          >
            Accept job
          </button>
        )}
        {canDecline && (
          <button
            onClick={() => runAction(() => jobService.declineJob(job.id))}
            disabled={actionLoading}
            className="rounded-lg border border-zinc-700 px-5 py-2 font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
          >
            Decline
          </button>
        )}
        {canStart && (
          <button
            onClick={() => runAction(() => jobService.updateJobStatus(job.id, 'IN_PROGRESS'))}
            disabled={actionLoading}
            className="rounded-lg bg-accent px-5 py-2 font-medium text-zinc-950 hover:opacity-90 disabled:opacity-50"
          >
            Start job
          </button>
        )}
        {canComplete && (
          <button
            onClick={() => runAction(() => jobService.updateJobStatus(job.id, 'COMPLETED'))}
            disabled={actionLoading}
            className="rounded-lg bg-accent px-5 py-2 font-medium text-zinc-950 hover:opacity-90 disabled:opacity-50"
          >
            Mark completed
          </button>
        )}
        {canCancel && (
          <button
            onClick={() => runAction(() => jobService.updateJobStatus(job.id, 'CANCELLED'))}
            disabled={actionLoading}
            className="rounded-lg border border-red-500/30 px-5 py-2 font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50"
          >
            Cancel job
          </button>
        )}
      </div>
    </main>
  );
}

export default JobDetail;
