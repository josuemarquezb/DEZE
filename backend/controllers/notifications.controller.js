// controllers/notifications.controller.js — in-app + email notifications.
//
// Two kinds of exports here:
//   - HTTP handlers (getUserNotifications, markAsRead, deleteNotification,
//     getUnreadCount) — mounted in routes/notifications.js, act on the
//     authenticated user's own notifications.
//   - Internal helpers (createNotification, sendEmailNotification, notifyUser,
//     notifyAdminNewSubscriber) — called directly from other controllers
//     (auth, jobs, messages, reviews, admin/detailers) at the point an event
//     happens. Never exposed as routes, and never throw — a broken
//     notification must not break the feature that triggered it.

import prisma from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendEmail, wrapEmailHtml, FRONTEND_URL } from '../utils/mailer.js';

// --- Templates ---------------------------------------------------------
// One function per NotificationType, building both the in-app row
// (title/message) and the email (subject/heading/body/CTA) from the same
// event data, so the two channels never drift out of sync with each other.

const NOTIFICATION_TEMPLATES = {
  WELCOME: ({ firstName }) => ({
    title: 'Welcome to DEZE!',
    message: `Welcome aboard, ${firstName}! Finish setting up your profile to start getting job requests.`,
    email: {
      subject: 'Welcome to DEZE 🚗',
      heading: `Welcome to DEZE, ${firstName}!`,
      bodyHtml: `<p>Your detailer account is live. Add your services, pricing, and a few photos so customers near you can find and book you.</p>`,
      ctaText: 'Complete your profile',
      ctaUrl: `${FRONTEND_URL}/onboarding`,
    },
  }),

  JOB_POSTED: ({ jobId, jobTitle, locationAddress }) => ({
    title: 'New job near you',
    message: `A new job "${jobTitle}" was posted near you${locationAddress ? ` (${locationAddress})` : ''}.`,
    email: {
      subject: `New job near you: ${jobTitle}`,
      heading: 'A new job was posted near you',
      bodyHtml: `<p><strong>${jobTitle}</strong>${locationAddress ? `<br/>${locationAddress}` : ''}</p><p>Open jobs get accepted fast — take a look before it's gone.</p>`,
      ctaText: 'View job',
      ctaUrl: `${FRONTEND_URL}/jobs/${jobId}`,
    },
  }),

  JOB_ACCEPTED: ({ jobId, jobTitle, detailerFirstName, detailerLastName }) => ({
    title: 'Someone accepted your job',
    message: `${detailerFirstName} ${detailerLastName} accepted your job "${jobTitle}".`,
    email: {
      subject: `${detailerFirstName} accepted your job`,
      heading: 'Your job was accepted!',
      bodyHtml: `<p><strong>${detailerFirstName} ${detailerLastName}</strong> accepted <strong>${jobTitle}</strong> and will be in touch.</p>`,
      ctaText: 'View job',
      ctaUrl: `${FRONTEND_URL}/jobs/${jobId}`,
    },
  }),

  JOB_COMPLETED: ({ jobId, jobTitle }) => ({
    title: 'Job completed — leave a review',
    message: `"${jobTitle}" is complete. Let others know how it went.`,
    email: {
      subject: `How did it go? Rate your detail — ${jobTitle}`,
      heading: 'Your job is complete!',
      bodyHtml: `<p><strong>${jobTitle}</strong> has been marked complete. Your feedback helps other customers pick the right detailer — got a minute to leave a review?</p>`,
      ctaText: 'Leave a review',
      ctaUrl: `${FRONTEND_URL}/jobs/${jobId}/review`,
    },
  }),

  MESSAGE: ({ jobId, senderFirstName }) => ({
    title: 'New message',
    message: `${senderFirstName} sent you a new message.`,
    email: null, // in-app only, per spec
  }),

  REVIEW: ({ jobId, rating, customerFirstName }) => ({
    title: 'New review received',
    message: `${customerFirstName} left you a ${rating}-star review.`,
    email: null, // in-app only, per spec
  }),

  VERIFIED: ({ firstName }) => ({
    title: "You're verified!",
    message: 'Congratulations — your detailer account has been verified. You can now be found in customer searches.',
    email: {
      subject: "You're verified on DEZE! 🎉",
      heading: `Congratulations, ${firstName}!`,
      bodyHtml: `<p>Your detailer account has been verified. You'll now show up as <strong>Verified</strong> on your profile and in customer searches — one less thing for customers to worry about.</p>`,
      ctaText: 'View your dashboard',
      ctaUrl: `${FRONTEND_URL}/detailer/dashboard`,
    },
  }),
};

const toPublicNotification = (n) => ({
  id: n.id,
  type: n.type,
  title: n.title,
  message: n.message,
  data: n.data,
  read: n.read,
  createdAt: n.createdAt,
});

// --- Internal helpers (called from other controllers) ------------------

/** Inserts an in-app notification row for a user. Returns null (and logs) on failure rather than throwing. */
export const createNotification = async (userId, type, data = {}) => {
  const template = NOTIFICATION_TEMPLATES[type];
  if (!template) {
    console.error(`[notifications] unknown type: ${type}`);
    return null;
  }

  try {
    const { title, message } = template(data);
    return await prisma.notification.create({ data: { userId, type, title, message, data } });
  } catch (err) {
    console.error(`[notifications] failed to create — user=${userId} type=${type}:`, err.message);
    return null;
  }
};

/** Sends the email half of a notification template, if that type has one. */
export const sendEmailNotification = async (userId, type, data = {}) => {
  const template = NOTIFICATION_TEMPLATES[type];
  if (!template) {
    console.error(`[notifications] unknown type: ${type}`);
    return;
  }

  const { email } = template(data);
  if (!email) return; // this type is in-app only

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (!user) return;

  await sendEmail({
    to: user.email,
    subject: email.subject,
    html: wrapEmailHtml(email),
  });
};

/**
 * notifyUser — the single call site most triggers use: writes the in-app
 * notification and, if `email: true` and the template has an email half,
 * sends it too. MESSAGE notifications are deduped — a burst of chat
 * messages doesn't flood the recipient with one notification per message,
 * only one unread "new message" notification per job until they read it.
 */
export const notifyUser = async (userId, type, data = {}, { email = false } = {}) => {
  try {
    if (type === 'MESSAGE' && data.jobId) {
      const existing = await prisma.notification.findFirst({
        where: { userId, type: 'MESSAGE', read: false, data: { path: ['jobId'], equals: data.jobId } },
      });
      if (existing) return existing;
    }

    const notification = await createNotification(userId, type, data);
    if (email) await sendEmailNotification(userId, type, data);
    return notification;
  } catch (err) {
    // A notification failure (e.g. a DB blip on the dedupe lookup) must
    // never fail the feature that triggered it — job creation, accepting a
    // job, etc. Log and move on.
    console.error(`[notifications] notifyUser failed — user=${userId} type=${type}:`, err.message);
    return null;
  }
};

/**
 * notifyAdminNewSubscriber — low-priority, admin-only email when a new
 * detailer signs up. Not part of the Notification table/enum (it's not a
 * per-user in-app event) — just a direct email to whoever's configured as
 * the platform admin contact. No-ops quietly if unconfigured.
 */
export const notifyAdminNewSubscriber = async ({ firstName, lastName, email: detailerEmail }) => {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) return;

  try {
    await sendEmail({
      to: adminEmail,
      subject: `New detailer signup: ${firstName} ${lastName}`,
      html: wrapEmailHtml({
        heading: 'New detailer signup',
        bodyHtml: `<p><strong>${firstName} ${lastName}</strong> (${detailerEmail}) just created a detailer account.</p>`,
        ctaText: 'Review in admin dashboard',
        ctaUrl: `${FRONTEND_URL}/admin/detailers`,
      }),
    });
  } catch (err) {
    console.error('[notifications] notifyAdminNewSubscriber failed:', err.message);
  }
};

// --- HTTP handlers -------------------------------------------------------

/** GET /api/notifications — the authenticated user's notifications, newest first. */
export const getUserNotifications = asyncHandler(async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.userId },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({ notifications: notifications.map(toPublicNotification), count: notifications.length });
});

/** GET /api/notifications/unread-count — count of unread notifications for the authenticated user. */
export const getUnreadCount = asyncHandler(async (req, res) => {
  const unreadCount = await prisma.notification.count({ where: { userId: req.user.userId, read: false } });
  res.status(200).json({ unreadCount });
});

/** PUT /api/notifications/:id/read — mark a single notification as read (only its owner may do this). */
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });
  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  if (notification.userId !== req.user.userId) {
    return res.status(403).json({ message: 'Not authorized to modify this notification' });
  }

  const updated = await prisma.notification.update({ where: { id: notification.id }, data: { read: true } });
  res.status(200).json({ notification: toPublicNotification(updated) });
});

/** PUT /api/notifications/read-all — mark every unread notification for the authenticated user as read. */
export const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await prisma.notification.updateMany({
    where: { userId: req.user.userId, read: false },
    data: { read: true },
  });
  res.status(200).json({ markedRead: result.count });
});

/** DELETE /api/notifications/:id — delete a single notification (only its owner may do this). */
export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });
  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  if (notification.userId !== req.user.userId) {
    return res.status(403).json({ message: 'Not authorized to delete this notification' });
  }

  await prisma.notification.delete({ where: { id: notification.id } });
  res.status(200).json({ message: 'Notification deleted' });
});

/** DELETE /api/notifications — delete all of the authenticated user's notifications. */
export const deleteAllNotifications = asyncHandler(async (req, res) => {
  const result = await prisma.notification.deleteMany({ where: { userId: req.user.userId } });
  res.status(200).json({ deleted: result.count });
});
