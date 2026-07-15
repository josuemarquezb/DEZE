// services/jobService.js — DetailJob API calls. Mirrors backend/routes/jobs.js.

import api from './api.js';

/** POST /jobs — customer posts a new detail request. */
export const createJob = (data) => api.post('/jobs', data).then((res) => res.data.job);

/** GET /jobs/:id — a single job's full details. */
export const getJobById = (jobId) => api.get(`/jobs/${jobId}`).then((res) => res.data.job);

/** GET /jobs/nearby — open jobs near the authenticated detailer. */
export const getNearbyJobs = (lat, lng, radius) =>
  api.get('/jobs/nearby', { params: { lat, lng, radius } }).then((res) => res.data.jobs);

/** GET /jobs/nearby?format=geojson — same data as getNearbyJobs, as a GeoJSON FeatureCollection (for JobsMap). */
export const getNearbyJobsGeoJSON = (lat, lng, radius) =>
  api.get('/jobs/nearby', { params: { lat, lng, radius, format: 'geojson' } }).then((res) => res.data);

/** GET /jobs/search — search open jobs by service type, date, and budget. */
export const searchJobs = (filters) => api.get('/jobs/search', { params: filters }).then((res) => res.data);

/** GET /jobs/my-requests — the authenticated customer's own posted jobs. */
export const getMyPostedJobs = () => api.get('/jobs/my-requests').then((res) => res.data.jobs);

/** GET /jobs/my-accepted — jobs the authenticated detailer has accepted. */
export const getMyAcceptedJobs = () => api.get('/jobs/my-accepted').then((res) => res.data.jobs);

/** PUT /jobs/:id/accept — detailer accepts a job. */
export const acceptJob = (jobId) => api.put(`/jobs/${jobId}/accept`).then((res) => res.data.job);

/** PUT /jobs/:id/decline — detailer declines/backs out of a job. */
export const declineJob = (jobId) => api.put(`/jobs/${jobId}/decline`).then((res) => res.data.job);

/** PUT /jobs/:id/status — update a job's status. */
export const updateJobStatus = (jobId, status) =>
  api.put(`/jobs/${jobId}/status`, { status }).then((res) => res.data.job);

/** PUT /jobs/:id/price — detailer proposes/updates the agreed price. */
export const proposePrice = (jobId, proposedPrice) =>
  api.put(`/jobs/${jobId}/price`, { proposedPrice }).then((res) => res.data.job);
