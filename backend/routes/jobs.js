// routes/jobs.js — DetailJob endpoints. Mounted at /api/jobs.
// NOTE: literal paths (/nearby, /search, /my-requests, /my-accepted, /history)
// are registered before '/:id' so they aren't swallowed by the param route.

import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import * as jobsController from '../controllers/jobs.controller.js';

const router = Router();

/** POST /api/jobs — create a new job request (protected, customer). */
router.post('/', requireAuth, requireRole('CUSTOMER'), jobsController.createJob);

/** GET /api/jobs/nearby — open jobs near the authenticated detailer (protected, detailer). */
router.get('/nearby', requireAuth, requireRole('DETAILER'), jobsController.getNearbyJobs);

/** GET /api/jobs/search — search open jobs by service type, date, and budget (protected, detailer). */
router.get('/search', requireAuth, requireRole('DETAILER'), jobsController.searchJobs);

/** GET /api/jobs/my-requests — the authenticated customer's own job requests (protected, customer). */
router.get('/my-requests', requireAuth, requireRole('CUSTOMER'), jobsController.getMyRequests);

/** GET /api/jobs/my-accepted — jobs the authenticated detailer has accepted (protected, detailer). */
router.get('/my-accepted', requireAuth, requireRole('DETAILER'), jobsController.getMyAccepted);

/** GET /api/jobs/history — the authenticated user's full job history (protected). */
router.get('/history', requireAuth, jobsController.getHistory);

/** GET /api/jobs/:id — a single job's details. */
router.get('/:id', jobsController.getJobById);

/** PUT /api/jobs/:id/accept — accept a job request (protected, detailer). */
router.put('/:id/accept', requireAuth, requireRole('DETAILER'), jobsController.acceptJob);

/** PUT /api/jobs/:id/decline — decline a job request (protected, detailer). */
router.put('/:id/decline', requireAuth, requireRole('DETAILER'), jobsController.declineJob);

/** PUT /api/jobs/:id/status — update a job's status (protected). */
router.put('/:id/status', requireAuth, jobsController.updateStatus);

/** PUT /api/jobs/:id/price — propose/update the agreed price (protected, detailer). */
router.put('/:id/price', requireAuth, requireRole('DETAILER'), jobsController.proposePrice);

/** POST /api/jobs/:id/photos — upload before/after photos (protected). */
router.post('/:id/photos', requireAuth, jobsController.uploadPhotos);

export default router;
