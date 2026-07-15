// controllers/messages.controller.js — job chat business logic.
// Real-time delivery (e.g. via websockets/socket.io) will hook in alongside
// these once persistence is implemented; for now the frontend polls.

import prisma from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { isValidNonEmptyString } from '../utils/validators.js';
import { notifyUser } from './notifications.controller.js';

const MAX_MESSAGE_LENGTH = 500;

// Messaging only opens once a detailer is attached to the job (ACCEPTED
// onward) — an open REQUESTED job has no counterpart to talk to yet, and a
// CANCELLED job has nothing left to coordinate.
const MESSAGEABLE_STATUSES = ['ACCEPTED', 'IN_PROGRESS', 'COMPLETED'];

const SENDER_SELECT = { firstName: true, lastName: true, profilePhoto: true };

const toPublicMessage = (message) => ({
  id: message.id,
  jobId: message.jobId,
  senderId: message.senderId,
  senderType: message.senderType,
  recipientId: message.recipientId,
  messageText: message.messageText,
  createdAt: message.createdAt,
  readAt: message.readAt,
  sender: {
    firstName: message.sender.firstName,
    lastName: message.sender.lastName,
    profilePhoto: message.sender.profilePhoto,
  },
});

/**
 * Loads a job's participant identities (by User.id, not profile id) so
 * callers can check "is this authenticated user part of this job" without
 * repeating the query shape everywhere.
 */
const getJobParticipants = (jobId) =>
  prisma.detailJob.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      status: true,
      customer: { select: { userId: true } },
      detailer: { select: { userId: true } },
    },
  });

/** Sends a new message on a job's chat thread. */
export const sendMessage = asyncHandler(async (req, res) => {
  const { jobId, messageText } = req.body;

  if (!isValidNonEmptyString(jobId, 100)) {
    return res.status(400).json({ message: 'jobId is required' });
  }
  if (!isValidNonEmptyString(messageText, MAX_MESSAGE_LENGTH)) {
    return res
      .status(400)
      .json({ message: `messageText is required and must be at most ${MAX_MESSAGE_LENGTH} characters` });
  }

  const job = await getJobParticipants(jobId);
  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }

  const isCustomer = job.customer?.userId === req.user.userId;
  const isDetailer = job.detailer?.userId === req.user.userId;

  if (!isCustomer && !isDetailer) {
    return res.status(403).json({ message: 'You are not part of this job' });
  }
  if (!MESSAGEABLE_STATUSES.includes(job.status)) {
    return res
      .status(409)
      .json({ message: 'Messaging opens once a detailer has accepted this job' });
  }

  const recipientId = isCustomer ? job.detailer.userId : job.customer.userId;

  const message = await prisma.message.create({
    data: {
      jobId,
      senderId: req.user.userId,
      senderType: req.user.userType,
      recipientId,
      messageText,
    },
    include: { sender: { select: SENDER_SELECT } },
  });

  // In-app only (see NOTIFICATION_TEMPLATES.MESSAGE) — deduped against any
  // existing unread "new message" notification for this job so a burst of
  // messages doesn't spam the recipient's notification list.
  notifyUser(recipientId, 'MESSAGE', { jobId, senderFirstName: message.sender.firstName });

  res.status(201).json({ message: toPublicMessage(message) });
});

/** Returns the full message history for a job, oldest first. */
export const getMessagesForJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const job = await getJobParticipants(jobId);
  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }

  const isCustomer = job.customer?.userId === req.user.userId;
  const isDetailer = job.detailer?.userId === req.user.userId;

  if (!isCustomer && !isDetailer) {
    return res.status(403).json({ message: 'You are not part of this job' });
  }

  const messages = await prisma.message.findMany({
    where: { jobId },
    include: { sender: { select: SENDER_SELECT } },
    orderBy: { createdAt: 'asc' },
  });

  res.status(200).json({ messages: messages.map(toPublicMessage) });
});

/** Marks a single message as read (sets readAt) — only its recipient may do this. */
export const markAsRead = asyncHandler(async (req, res) => {
  const message = await prisma.message.findUnique({ where: { id: req.params.id } });
  if (!message) {
    return res.status(404).json({ message: 'Message not found' });
  }
  if (message.recipientId !== req.user.userId) {
    return res.status(403).json({ message: 'Only the recipient can mark a message as read' });
  }

  const updated = await prisma.message.update({
    where: { id: message.id },
    data: { readAt: message.readAt ?? new Date() },
    include: { sender: { select: SENDER_SELECT } },
  });

  res.status(200).json({ message: toPublicMessage(updated) });
});

/** Marks every unread message addressed to the authenticated user on a job as read. */
export const markJobMessagesAsRead = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const job = await getJobParticipants(jobId);
  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }

  const isCustomer = job.customer?.userId === req.user.userId;
  const isDetailer = job.detailer?.userId === req.user.userId;

  if (!isCustomer && !isDetailer) {
    return res.status(403).json({ message: 'You are not part of this job' });
  }

  const result = await prisma.message.updateMany({
    where: { jobId, recipientId: req.user.userId, readAt: null },
    data: { readAt: new Date() },
  });

  res.status(200).json({ markedRead: result.count });
});

/** Counts unread messages addressed to the authenticated user, across all jobs. */
export const getUnreadCount = asyncHandler(async (req, res) => {
  const unreadCount = await prisma.message.count({
    where: { recipientId: req.user.userId, readAt: null },
  });

  res.status(200).json({ unreadCount });
});

/** Uploads a photo attachment to a job's chat thread. */
export const uploadAttachment = asyncHandler(async (req, res) => {
  res.status(501).json({ message: 'Not implemented: uploadAttachment' });
});
