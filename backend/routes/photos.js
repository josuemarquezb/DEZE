// routes/photos.js — photo/document upload endpoints. Mounted at /api/photos.
// File handling (multer) lives in utils/upload.js; persistence lives in
// controllers/photoController.js.

import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { createUploader, uploadMiddleware } from '../utils/upload.js';
import * as photoController from '../controllers/photoController.js';

const router = Router();

const profileUpload = createUploader('profiles', (req) => req.user.userId);
const equipmentUpload = createUploader('equipment', (req) => req.user.userId);
const verificationUpload = createUploader('verification', (req) => req.user.userId);
const jobUpload = createUploader((req) => `jobs/${req.params.jobId}`, (req) => req.params.jobId);

/** POST /api/photos/profile — upload the authenticated detailer's profile photo (protected, detailer only). */
router.post(
  '/profile',
  requireAuth,
  requireRole('DETAILER'),
  uploadMiddleware(profileUpload.single('photo')),
  photoController.uploadProfilePhoto
);

/** POST /api/photos/equipment — upload equipment photos (protected, detailer only). */
router.post(
  '/equipment',
  requireAuth,
  requireRole('DETAILER'),
  uploadMiddleware(equipmentUpload.array('photos', 10)),
  photoController.uploadEquipmentPhoto
);

/** POST /api/photos/verification — upload verification documents (protected, detailer only). */
router.post(
  '/verification',
  requireAuth,
  requireRole('DETAILER'),
  uploadMiddleware(verificationUpload.array('photos', 10)),
  photoController.uploadVerificationDoc
);

/** POST /api/photos/job/:jobId — upload before/after job photos (protected, customer only). */
router.post(
  '/job/:jobId',
  requireAuth,
  requireRole('CUSTOMER'),
  uploadMiddleware(jobUpload.array('photos', 10)),
  photoController.uploadJobPhotos
);

/** GET /api/photos/job/:jobId — fetch a job's before/after photos (public). */
router.get('/job/:jobId', photoController.getJobPhotos);

/** DELETE /api/photos/:photoId — delete a photo owned by the authenticated user (protected). */
router.delete('/:photoId', requireAuth, photoController.deletePhoto);

export default router;
