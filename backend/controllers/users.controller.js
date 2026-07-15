// controllers/users.controller.js — shared user account logic (stubs).
// Profile-type-specific fields live in detailers.controller.js instead.

import { asyncHandler } from '../utils/asyncHandler.js';

/** Returns the authenticated user's own profile (via req.user). */
export const getMe = asyncHandler(async (req, res) => {
  res.status(501).json({ message: 'Not implemented: getMe' });
});

/** Updates the authenticated user's own profile fields. */
export const updateMe = asyncHandler(async (req, res) => {
  res.status(501).json({ message: 'Not implemented: updateMe' });
});

/** Returns another user's public-facing profile by id. */
export const getPublicProfile = asyncHandler(async (req, res) => {
  res.status(501).json({ message: 'Not implemented: getPublicProfile' });
});

/** Uploads/replaces the authenticated user's profile photo. */
export const uploadPhoto = asyncHandler(async (req, res) => {
  res.status(501).json({ message: 'Not implemented: uploadPhoto' });
});
