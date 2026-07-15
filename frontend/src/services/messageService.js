// services/messageService.js — job chat API calls. Mirrors backend/routes/messages.js.

import api from './api.js';

/** POST /messages — send a message on a job's chat thread. */
export const sendMessage = (jobId, messageText) =>
  api.post('/messages', { jobId, messageText }).then((res) => res.data.message);

/** GET /messages/:jobId — the full message history for a job, oldest first. */
export const getJobMessages = (jobId) => api.get(`/messages/${jobId}`).then((res) => res.data.messages);

/** PUT /messages/:jobId/read-all — mark every unread message on a job as read. */
export const markAsRead = (jobId) => api.put(`/messages/${jobId}/read-all`).then((res) => res.data);

/** GET /messages/unread-count — total unread messages for the authenticated user. */
export const getUnreadCount = () => api.get('/messages/unread-count').then((res) => res.data.unreadCount);
