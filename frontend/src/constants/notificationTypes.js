// constants/notificationTypes.js — mirrors the NotificationType enum in
// database/schema.prisma, plus per-type icon/color for the bell + notification list.

export const NOTIFICATION_TYPES = [
  'WELCOME',
  'JOB_POSTED',
  'JOB_ACCEPTED',
  'JOB_COMPLETED',
  'MESSAGE',
  'REVIEW',
  'VERIFIED',
];

export const NOTIFICATION_TYPE_ICONS = {
  WELCOME: '🎉',
  JOB_POSTED: '📋',
  JOB_ACCEPTED: '✅',
  JOB_COMPLETED: '🏁',
  MESSAGE: '💬',
  REVIEW: '⭐',
  VERIFIED: '✔️',
};

export const NOTIFICATION_TYPE_COLOR_CLASSES = {
  WELCOME: 'bg-accent-purple/15 text-accent-purple',
  JOB_POSTED: 'bg-blue-500/15 text-blue-400',
  JOB_ACCEPTED: 'bg-sky-500/15 text-sky-400',
  JOB_COMPLETED: 'bg-accent-orange/15 text-accent-orange',
  MESSAGE: 'bg-accent/15 text-accent',
  REVIEW: 'bg-yellow-500/15 text-yellow-400',
  VERIFIED: 'bg-accent/15 text-accent',
};

/** Given a notification's `data`, picks the page it should navigate to when clicked. */
export const notificationLinkFor = (notification) => {
  const { type, data } = notification;
  if (data?.jobId) {
    return type === 'MESSAGE' ? `/jobs/${data.jobId}/chat` : `/jobs/${data.jobId}`;
  }
  if (type === 'WELCOME') return '/onboarding';
  if (type === 'VERIFIED') return '/detailer/dashboard';
  return null;
};
