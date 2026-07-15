// routes/notifications.js — in-app notification endpoints. Mounted at /api/notifications.
// NOTE: literal paths (/unread-count, /read-all) are registered before the
// '/:id' param routes so they aren't swallowed by the param route.

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as notificationsController from '../controllers/notifications.controller.js';

const router = Router();

router.use(requireAuth);

/** GET /api/notifications — the authenticated user's notifications, newest first (protected). */
router.get('/', notificationsController.getUserNotifications);

/** GET /api/notifications/unread-count — count of unread notifications (protected). */
router.get('/unread-count', notificationsController.getUnreadCount);

/** PUT /api/notifications/read-all — mark every unread notification as read (protected). */
router.put('/read-all', notificationsController.markAllAsRead);

/** DELETE /api/notifications — delete all of the authenticated user's notifications (protected). */
router.delete('/', notificationsController.deleteAllNotifications);

/** PUT /api/notifications/:id/read — mark a single notification as read (protected). */
router.put('/:id/read', notificationsController.markAsRead);

/** DELETE /api/notifications/:id — delete a single notification (protected). */
router.delete('/:id', notificationsController.deleteNotification);

export default router;
