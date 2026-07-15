// services/reviewService.js — Review API calls. Mirrors backend/routes/reviews.js.

import api from './api.js';

/** POST /reviews — rate a completed job's detailer. */
export const createReview = (jobId, rating, comment) =>
  api.post('/reviews', { jobId, rating, comment }).then((res) => res.data.review);

/** GET /reviews/:detailerId — all reviews written about a detailer. */
export const getDetailerReviews = (detailerId) =>
  api.get(`/reviews/${detailerId}`).then((res) => res.data.reviews);

/** GET /reviews/:detailerId/stats — average rating, total count, and 1-5 star breakdown. */
export const getReviewStats = (detailerId) => api.get(`/reviews/${detailerId}/stats`).then((res) => res.data);
