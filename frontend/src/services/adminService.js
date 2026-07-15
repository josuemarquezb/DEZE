// services/adminService.js — admin API calls. Mirrors backend/routes/admin.js.
// Every call here requires an authenticated admin session — see RequireAdmin
// in App.jsx for the client-side route guard.

import api from './api.js';

/** GET /admin/dashboard — high-level platform metrics. */
export const getDashboardStats = () => api.get('/admin/dashboard').then((res) => res.data);

/** GET /admin/detailers — list all detailers. filters: { verificationStatus, search }. */
export const getAllDetailers = (filters = {}) =>
  api.get('/admin/detailers', { params: filters }).then((res) => res.data.detailers);

/** PUT /admin/detailers/:id/verify — approve/reject a detailer. status: 'APPROVED' | 'REJECTED'. */
export const verifyDetailer = (detailerId, status) =>
  api.put(`/admin/detailers/${detailerId}/verify`, { status }).then((res) => res.data.detailer);

/** GET /admin/detailers/:id/earnings — a detailer's full profile + earnings + recent jobs. */
export const getDetailerEarnings = (detailerId) =>
  api.get(`/admin/detailers/${detailerId}/earnings`).then((res) => res.data);

/** GET /admin/jobs — list all jobs. filters: { status, sortBy, sortDir, page, limit }. */
export const getAllJobs = (filters = {}) => api.get('/admin/jobs', { params: filters }).then((res) => res.data);

/** GET /admin/revenue — platform revenue breakdown + monthly chart + payouts. */
export const getRevenue = () => api.get('/admin/revenue').then((res) => res.data);

/** GET /admin/users/search — search users by name/email. */
export const searchUsers = (query) => api.get('/admin/users/search', { params: { q: query } }).then((res) => res.data.users);

/** POST /admin/disputes/:jobId — resolve a customer/detailer dispute. resolution: 'REFUND_CUSTOMER' | 'RELEASE_TO_DETAILER' | 'CANCEL_JOB'. */
export const handleDispute = (jobId, resolution, notes) =>
  api.post(`/admin/disputes/${jobId}`, { resolution, notes }).then((res) => res.data);
