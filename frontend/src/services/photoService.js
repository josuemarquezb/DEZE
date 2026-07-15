// services/photoService.js — Photo upload API calls. Mirrors backend/routes/photos.js.
// Uploads use multipart/form-data; onProgress (optional) receives a 0-100 percentage.

import api from './api.js';

const toPercent = (event) => (event.total ? Math.round((event.loaded * 100) / event.total) : 0);

/** POST /photos/profile — detailer uploads/replaces their profile photo. */
export const uploadProfilePhoto = (file, onProgress) => {
  const formData = new FormData();
  formData.append('photo', file);
  return api
    .post('/photos/profile', formData, { onUploadProgress: (e) => onProgress?.(toPercent(e)) })
    .then((res) => res.data.url);
};

/** POST /photos/equipment — detailer adds one or more equipment photos. */
export const uploadEquipmentPhoto = (file, onProgress) => {
  const formData = new FormData();
  formData.append('photos', file);
  return api
    .post('/photos/equipment', formData, { onUploadProgress: (e) => onProgress?.(toPercent(e)) })
    .then((res) => res.data);
};

/** POST /photos/verification — detailer adds one or more verification documents. */
export const uploadVerificationDoc = (file, onProgress) => {
  const formData = new FormData();
  formData.append('photos', file);
  return api
    .post('/photos/verification', formData, { onUploadProgress: (e) => onProgress?.(toPercent(e)) })
    .then((res) => res.data);
};

/** POST /photos/job/:jobId — customer uploads before/after photos. type: 'before' | 'after'. */
export const uploadJobPhoto = (jobId, file, type, onProgress) => {
  const formData = new FormData();
  formData.append('photos', file);
  formData.append('type', type);
  return api
    .post(`/photos/job/${jobId}`, formData, { onUploadProgress: (e) => onProgress?.(toPercent(e)) })
    .then((res) => res.data);
};

/** GET /photos/job/:jobId — fetch a job's before/after photos (public). */
export const getJobPhotos = (jobId) => api.get(`/photos/job/${jobId}`).then((res) => res.data);

/** DELETE /photos/:photoId — delete a photo by its URL (e.g. "/uploads/equipment/xyz.jpg"). */
export const deletePhoto = (photoUrl) => {
  const relativePath = photoUrl.replace(/^\/uploads\//, '');
  return api.delete(`/photos/${encodeURIComponent(relativePath)}`).then((res) => res.data);
};
