// controllers/reviews.controller.js — job review business logic: customers
// rate detailers on completed jobs; ratings roll up onto DetailerProfile.

import prisma from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { isValidNonEmptyString, isValidRating } from '../utils/validators.js';
import { notifyUser } from './notifications.controller.js';

const MAX_COMMENT_LENGTH = 500;
const RATING_VALUES = [1, 2, 3, 4, 5];

/** Shapes a Review for public display — customer's first name + last initial, never email. */
const toPublicReview = (review) => ({
  id: review.id,
  jobId: review.jobId,
  rating: review.rating,
  comment: review.comment,
  createdAt: review.createdAt,
  customerFirstName: review.customer.user.firstName,
  customerLastInitial: review.customer.user.lastName?.[0] ?? '',
});

/** Recalculates and persists a detailer's aggregate rating + review count. */
export const updateReviewerProfile = async (detailerId) => {
  const agg = await prisma.review.aggregate({
    where: { detailerId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.detailerProfile.update({
    where: { id: detailerId },
    data: { rating: agg._avg.rating ?? 0, totalReviews: agg._count.rating },
  });
};

/** POST /api/reviews — a customer rates a completed job's detailer. */
export const createReview = asyncHandler(async (req, res) => {
  const { jobId, rating, comment } = req.body;

  if (!isValidNonEmptyString(jobId, 100)) {
    return res.status(400).json({ message: 'jobId is required' });
  }
  if (!isValidRating(rating)) {
    return res.status(400).json({ message: 'rating must be an integer between 1 and 5' });
  }
  if (comment !== undefined && comment !== null && (typeof comment !== 'string' || comment.length > MAX_COMMENT_LENGTH)) {
    return res.status(400).json({ message: `comment must be a string of at most ${MAX_COMMENT_LENGTH} characters` });
  }

  const job = await prisma.detailJob.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      status: true,
      customerId: true,
      detailerId: true,
      customer: { select: { userId: true } },
      detailer: { select: { userId: true } },
    },
  });

  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }
  if (job.customer.userId !== req.user.userId) {
    return res.status(403).json({ message: 'You can only review your own jobs' });
  }
  if (job.status !== 'COMPLETED') {
    return res.status(409).json({ message: 'You can only review a completed job' });
  }

  const existingReview = await prisma.review.findUnique({ where: { jobId } });
  if (existingReview) {
    return res.status(409).json({ message: 'You have already reviewed this job' });
  }

  const review = await prisma.review.create({
    data: {
      jobId,
      customerId: job.customerId,
      detailerId: job.detailerId,
      rating,
      comment: comment || null,
    },
    include: { customer: { include: { user: { select: { firstName: true, lastName: true } } } } },
  });

  await updateReviewerProfile(job.detailerId);

  console.log(`[reviews] review created — job=${jobId} detailer=${job.detailerId} rating=${rating}`);

  // In-app only (see NOTIFICATION_TEMPLATES.REVIEW).
  notifyUser(job.detailer.userId, 'REVIEW', {
    jobId,
    rating,
    customerFirstName: review.customer.user.firstName,
  });

  res.status(201).json({ review: toPublicReview(review) });
});

/** GET /api/reviews/:detailerId — all reviews written about a detailer (public). */
export const getDetailerReviews = asyncHandler(async (req, res) => {
  const { detailerId } = req.params;

  const profile = await prisma.detailerProfile.findUnique({ where: { id: detailerId }, select: { id: true } });
  if (!profile) {
    return res.status(404).json({ message: 'Detailer not found' });
  }

  const reviews = await prisma.review.findMany({
    where: { detailerId },
    include: { customer: { include: { user: { select: { firstName: true, lastName: true } } } } },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({ reviews: reviews.map(toPublicReview), count: reviews.length });
});

/** GET /api/reviews/:detailerId/stats — average rating, total count, and 1-5 star breakdown (public). */
export const getReviewStats = asyncHandler(async (req, res) => {
  const { detailerId } = req.params;

  const profile = await prisma.detailerProfile.findUnique({ where: { id: detailerId }, select: { id: true } });
  if (!profile) {
    return res.status(404).json({ message: 'Detailer not found' });
  }

  const [agg, grouped] = await prisma.$transaction([
    prisma.review.aggregate({ where: { detailerId }, _avg: { rating: true }, _count: { rating: true } }),
    prisma.review.groupBy({ by: ['rating'], where: { detailerId }, _count: { rating: true } }),
  ]);

  const breakdown = Object.fromEntries(RATING_VALUES.map((n) => [n, 0]));
  grouped.forEach((g) => {
    breakdown[g.rating] = g._count.rating;
  });

  res.status(200).json({
    averageRating: agg._avg.rating ?? 0,
    totalReviews: agg._count.rating,
    breakdown,
  });
});
