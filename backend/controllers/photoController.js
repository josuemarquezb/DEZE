// controllers/photoController.js — photo/document upload, retrieval, and
// deletion. Files themselves live on disk (see utils/upload.js); only their
// public URLs are persisted, directly on the owning row (User.profilePhoto,
// DetailerProfile.equipmentPhotos/verificationDocs, DetailJob.photosBefore/
// photosAfter) — there's no separate Photo table.

import fs from 'fs';
import path from 'path';
import prisma from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { UPLOADS_ROOT } from '../utils/upload.js';

const JOB_PHOTO_TYPES = ['before', 'after'];

const findDetailerProfile = (userId) => prisma.detailerProfile.findUnique({ where: { userId } });
const findCustomerProfile = (userId) => prisma.customerProfile.findUnique({ where: { userId } });

const urlFor = (...segments) => `/uploads/${segments.join('/')}`;

/** POST /api/photos/profile — a detailer uploads/replaces their profile photo. */
export const uploadProfilePhoto = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'A photo file is required' });
  }

  const url = urlFor('profiles', req.file.filename);
  const user = await prisma.user.update({
    where: { id: req.user.userId },
    data: { profilePhoto: url },
    select: { profilePhoto: true },
  });

  console.log(`[photos] profile photo uploaded — user=${req.user.userId}`);
  res.status(201).json({ url: user.profilePhoto });
});

/** POST /api/photos/equipment — a detailer adds one or more equipment photos. */
export const uploadEquipmentPhoto = asyncHandler(async (req, res) => {
  if (!req.files?.length) {
    return res.status(400).json({ message: 'At least one photo file is required' });
  }

  const profile = await findDetailerProfile(req.user.userId);
  if (!profile) {
    return res.status(404).json({ message: 'Detailer profile not found' });
  }

  const uploaded = req.files.map((file) => urlFor('equipment', file.filename));
  const updated = await prisma.detailerProfile.update({
    where: { userId: req.user.userId },
    data: { equipmentPhotos: { push: uploaded } },
    select: { equipmentPhotos: true },
  });

  console.log(`[photos] equipment photos uploaded — detailer=${profile.id} count=${uploaded.length}`);
  res.status(201).json({ equipmentPhotos: updated.equipmentPhotos, uploaded });
});

/** POST /api/photos/verification — a detailer adds one or more verification documents. */
export const uploadVerificationDoc = asyncHandler(async (req, res) => {
  if (!req.files?.length) {
    return res.status(400).json({ message: 'At least one document file is required' });
  }

  const profile = await findDetailerProfile(req.user.userId);
  if (!profile) {
    return res.status(404).json({ message: 'Detailer profile not found' });
  }

  const uploaded = req.files.map((file) => urlFor('verification', file.filename));
  const updated = await prisma.detailerProfile.update({
    where: { userId: req.user.userId },
    data: { verificationDocs: { push: uploaded } },
    select: { verificationDocs: true },
  });

  console.log(`[photos] verification docs uploaded — detailer=${profile.id} count=${uploaded.length}`);
  res.status(201).json({ verificationDocs: updated.verificationDocs, uploaded });
});

/** POST /api/photos/job/:jobId — a customer uploads before/after photos for their own completed job. */
export const uploadJobPhotos = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const { type } = req.body;

  if (!JOB_PHOTO_TYPES.includes(type)) {
    return res.status(400).json({ message: `type must be one of: ${JOB_PHOTO_TYPES.join(', ')}` });
  }
  if (!req.files?.length) {
    return res.status(400).json({ message: 'At least one photo file is required' });
  }

  const job = await prisma.detailJob.findUnique({ where: { id: jobId } });
  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }

  const customerProfile = await findCustomerProfile(req.user.userId);
  if (!customerProfile || job.customerId !== customerProfile.id) {
    return res.status(403).json({ message: 'Only the customer who posted this job can upload job photos' });
  }
  if (job.status !== 'COMPLETED') {
    return res.status(409).json({ message: 'Before/after photos can only be uploaded once the job is completed' });
  }

  const uploaded = req.files.map((file) => urlFor('jobs', jobId, file.filename));
  const field = type === 'before' ? 'photosBefore' : 'photosAfter';
  const updated = await prisma.detailJob.update({
    where: { id: jobId },
    data: { [field]: { push: uploaded } },
    select: { photosBefore: true, photosAfter: true },
  });

  console.log(`[photos] job ${type} photos uploaded — job=${jobId} count=${uploaded.length}`);
  res.status(201).json({ photosBefore: updated.photosBefore, photosAfter: updated.photosAfter, uploaded });
});

/** GET /api/photos/job/:jobId — public: fetch a job's before/after photos. */
export const getJobPhotos = asyncHandler(async (req, res) => {
  const job = await prisma.detailJob.findUnique({
    where: { id: req.params.jobId },
    select: { photosBefore: true, photosAfter: true },
  });

  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }

  res.status(200).json({ photosBefore: job.photosBefore, photosAfter: job.photosAfter });
});

/**
 * DELETE /api/photos/:photoId — delete a photo the authenticated user owns.
 * photoId is the URL-encoded path relative to /uploads (e.g.
 * "equipment/<filename>" or "jobs/<jobId>/<filename>"); Express decodes the
 * route param automatically. Ownership is re-derived from the DB record that
 * currently references the URL, not parsed out of the filename.
 */
export const deletePhoto = asyncHandler(async (req, res) => {
  const relativePath = req.params.photoId;

  if (!relativePath || relativePath.includes('..')) {
    return res.status(400).json({ message: 'Invalid photo id' });
  }

  const [subdir, ...rest] = relativePath.split('/').filter(Boolean);
  const fullUrl = `/uploads/${relativePath}`;
  let removed = false;

  if (subdir === 'profiles') {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId }, select: { profilePhoto: true } });
    if (user?.profilePhoto === fullUrl) {
      await prisma.user.update({ where: { id: req.user.userId }, data: { profilePhoto: null } });
      removed = true;
    }
  } else if (subdir === 'equipment' || subdir === 'verification') {
    const profile = await findDetailerProfile(req.user.userId);
    const field = subdir === 'equipment' ? 'equipmentPhotos' : 'verificationDocs';
    if (profile && profile[field].includes(fullUrl)) {
      await prisma.detailerProfile.update({
        where: { userId: req.user.userId },
        data: { [field]: profile[field].filter((url) => url !== fullUrl) },
      });
      removed = true;
    }
  } else if (subdir === 'jobs') {
    const [jobId] = rest;
    const job = jobId ? await prisma.detailJob.findUnique({ where: { id: jobId } }) : null;
    const customerProfile = job ? await findCustomerProfile(req.user.userId) : null;
    const isOwner = job && customerProfile && job.customerId === customerProfile.id;

    if (isOwner && job.photosBefore.includes(fullUrl)) {
      await prisma.detailJob.update({
        where: { id: jobId },
        data: { photosBefore: job.photosBefore.filter((url) => url !== fullUrl) },
      });
      removed = true;
    } else if (isOwner && job.photosAfter.includes(fullUrl)) {
      await prisma.detailJob.update({
        where: { id: jobId },
        data: { photosAfter: job.photosAfter.filter((url) => url !== fullUrl) },
      });
      removed = true;
    }
  }

  if (!removed) {
    return res.status(404).json({ message: 'Photo not found, or you do not have permission to delete it' });
  }

  // Best-effort disk cleanup — the DB update above is the source of truth,
  // so a failure here shouldn't turn into a 500 for the caller.
  fs.unlink(path.join(UPLOADS_ROOT, relativePath), () => {});

  console.log(`[photos] photo deleted — user=${req.user.userId} path=${relativePath}`);
  res.status(200).json({ message: 'Photo deleted' });
});
