// services/detailerService.js — DetailerProfile API calls. Mirrors backend/routes/detailers.js.

import api from './api.js';

/**
 * Creates a detailer's profile. Every DETAILER account already has a blank
 * DetailerProfile row created at signup (see auth.controller.js), so
 * "creating" a profile and "updating" it are the same PUT /detailers/me call.
 */
export const createProfile = (data) => updateProfile(data);

/** PUT /detailers/me — update the authenticated detailer's own profile. */
export const updateProfile = (data) => api.put('/detailers/me', data).then((res) => res.data.detailer);

/** GET /detailers/me — the authenticated detailer's own full profile. */
export const getMyProfile = () => api.get('/detailers/me').then((res) => res.data.detailer);

/** GET /detailers/:id — a detailer's public profile + recent reviews. */
export const getProfile = (detailerId) =>
  api.get(`/detailers/${detailerId}`).then((res) => res.data);

/** GET /detailers/me/stats — the authenticated detailer's own stats. */
export const getMyStats = () => api.get('/detailers/me/stats').then((res) => res.data);

/**
 * POST /detailers/verify — (re)submit for verification review. Upload the
 * actual documents first via photoService.uploadVerificationDoc.
 */
export const submitVerification = () => api.post('/detailers/verify').then((res) => res.data);

/** GET /detailers/nearby — find detailers near a point. */
export const searchNearby = (lat, lng, radius, serviceType) =>
  api
    .get('/detailers/nearby', { params: { lat, lng, radius, serviceType } })
    .then((res) => res.data.detailers);

/** GET /detailers/search — search/filter detailers (serviceType, minRating, sortBy, page, limit). */
export const searchDetailers = (filters) =>
  api.get('/detailers/search', { params: filters }).then((res) => res.data);
