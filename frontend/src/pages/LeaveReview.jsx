// pages/LeaveReview.jsx — customer posts a review for a completed job.

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ReviewForm from '../components/ReviewForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import * as jobService from '../services/jobService.js';
import * as reviewService from '../services/reviewService.js';
import { SERVICE_TYPE_LABELS } from '../constants/serviceTypes.js';

function LeaveReview() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    jobService
      .getJobById(id)
      .then(setJob)
      .catch((err) => setError(err.response?.data?.message || 'Job not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async ({ rating, comment }) => {
    await reviewService.createReview(id, rating, comment);
    navigate(`/detailer/${job.detailer.id}`);
  };

  if (loading) {
    return <main className="px-4 py-16 text-center text-zinc-400">Loading job...</main>;
  }

  if (error) {
    return <main className="px-4 py-16 text-center text-red-400">{error}</main>;
  }

  if (job.customer?.userId !== user.id) {
    return <main className="px-4 py-16 text-center text-red-400">You can only review your own jobs.</main>;
  }

  if (job.status !== 'COMPLETED') {
    return (
      <main className="px-4 py-16 text-center text-zinc-400">
        You can only leave a review after this job is completed.
        <div className="mt-4">
          <Link to={`/jobs/${job.id}`} className="text-accent hover:underline">
            Back to job
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold text-white">Rate your detailer</h1>
      <p className="mb-6 text-zinc-400">
        {job.jobTitle} · {job.vehicleYear} {job.vehicleMake} {job.vehicleModel} ·{' '}
        {SERVICE_TYPE_LABELS[job.serviceType] || job.serviceType}
      </p>

      <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <p className="text-sm text-zinc-400">Detailer</p>
        <p className="font-medium text-white">
          {job.detailer?.firstName} {job.detailer?.lastName}
        </p>
        <p className="text-sm text-zinc-500">
          Completed {new Date(job.completedAt || job.requestedDate).toLocaleDateString()}
        </p>
      </div>

      <ReviewForm onSubmit={handleSubmit} />
    </main>
  );
}

export default LeaveReview;
