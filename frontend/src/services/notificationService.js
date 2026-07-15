// services/notificationService.js — Notification API calls. Mirrors backend/routes/notifications.js.

import api from './api.js';

/** GET /notifications — the authenticated user's notifications, newest first. */
export const getUserNotifications = () => api.get('/notifications').then((res) => res.data.notifications);

/** GET /notifications/unread-count — count of unread notifications. */
export const getUnreadCount = () => api.get('/notifications/unread-count').then((res) => res.data.unreadCount);

/** PUT /notifications/:id/read — mark a single notification as read. */
export const markAsRead = (notificationId) =>
  api.put(`/notifications/${notificationId}/read`).then((res) => res.data.notification);

/** PUT /notifications/read-all — mark every unread notification as read. */
export const markAllAsRead = () => api.put('/notifications/read-all').then((res) => res.data.markedRead);

/** DELETE /notifications/:id — delete a single notification. */
export const deleteNotification = (notificationId) =>
  api.delete(`/notifications/${notificationId}`).then((res) => res.data);

/** DELETE /notifications — delete all of the authenticated user's notifications. */
export const deleteAllNotifications = () => api.delete('/notifications').then((res) => res.data.deleted);

/**
 * markJobNotificationsAsRead(jobId) — auto-marks-read any unread
 * notifications tied to this job (e.g. "job accepted", "new message") once
 * the user opens the corresponding job/chat page. There's no batch
 * "mark by jobId" endpoint, so this fetches the (typically small) unread
 * set and marks each individually.
 */
export const markJobNotificationsAsRead = async (jobId) => {
  const notifications = await getUserNotifications();
  const toMark = notifications.filter((n) => !n.read && n.data?.jobId === jobId);
  await Promise.all(toMark.map((n) => markAsRead(n.id).catch(() => {})));
};
