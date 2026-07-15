// routes/reviews.js — job review endpoints. Mounted at /api/reviews.
// NOTE: /:detailerId/stats is a two-segment path so it can't be swallowed by
// the single-segment /:detailerId route below it regardless of order — kept
// first here just for readability.

import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import * as reviewsController from '../controllers/reviews.controller.js';

const router = Router();

/** POST /api/reviews — customer rates a completed job's detailer (protected, customer). */
router.post('/', requireAuth, requireRole('CUSTOMER'), reviewsController.createReview);

/** GET /api/reviews/:detailerId/stats — a detailer's rating breakdown (public). */
router.get('/:detailerId/stats', reviewsController.getReviewStats);

/** GET /api/reviews/:detailerId — all reviews written about a detailer (public). */
router.get('/:detailerId', reviewsController.getDetailerReviews);

export default router;
