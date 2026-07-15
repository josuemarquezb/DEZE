// routes/admin.js — internal admin tooling endpoints. Mounted at /api/admin.
// Every route here is admin-only.

import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import * as adminController from '../controllers/admin.controller.js';

const router = Router();

router.use(requireAuth, requireAdmin);

/** GET /api/admin/dashboard — high-level platform metrics (protected, admin). */
router.get('/dashboard', adminController.getDashboard);

/** GET /api/admin/detailers — list all detailers, with optional verificationStatus/search filters (protected, admin). */
router.get('/detailers', adminController.listDetailers);

/** GET /api/admin/detailers/:id/earnings — a detailer's full profile + earnings + recent jobs (protected, admin). */
router.get('/detailers/:id/earnings', adminController.getDetailerEarnings);

/** PUT /api/admin/detailers/:id/verify — approve/reject a detailer's verification (protected, admin). */
router.put('/detailers/:id/verify', adminController.verifyDetailer);

/** GET /api/admin/jobs — list all jobs, with optional status filter + sorting (protected, admin). */
router.get('/jobs', adminController.listJobs);

/** GET /api/admin/revenue — platform revenue reporting (protected, admin). */
router.get('/revenue', adminController.getRevenue);

/** GET /api/admin/users/search — search users by name/email (protected, admin). */
router.get('/users/search', adminController.searchUsers);

/** POST /api/admin/disputes/:jobId — resolve a customer/detailer dispute (protected, admin). */
router.post('/disputes/:jobId', adminController.handleDispute);

/** POST /api/admin/payouts/process — trigger payout processing (protected, admin). */
router.post('/payouts/process', adminController.processPayouts);

export default router;
