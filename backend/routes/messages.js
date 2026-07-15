// routes/messages.js — job chat endpoints. Mounted at /api/messages.
// NOTE: /unread-count is a literal path and must be registered before the
// '/:jobId' param route so it isn't swallowed as a jobId value.

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as messagesController from '../controllers/messages.controller.js';

const router = Router();

/** POST /api/messages — send a new message on a job's chat thread (protected). */
router.post('/', requireAuth, messagesController.sendMessage);

/** GET /api/messages/unread-count — count of unread messages for the authenticated user (protected). */
router.get('/unread-count', requireAuth, messagesController.getUnreadCount);

/** GET /api/messages/:jobId — the full message history for a job (protected). */
router.get('/:jobId', requireAuth, messagesController.getMessagesForJob);

/** PUT /api/messages/:id/read — mark a single message as read (protected). */
router.put('/:id/read', requireAuth, messagesController.markAsRead);

/** PUT /api/messages/:jobId/read-all — mark every unread message on a job as read (protected). */
router.put('/:jobId/read-all', requireAuth, messagesController.markJobMessagesAsRead);

/** POST /api/messages/:jobId/attachment — upload a photo attachment (protected). */
router.post('/:jobId/attachment', requireAuth, messagesController.uploadAttachment);

export default router;
