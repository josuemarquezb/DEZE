// constants/jobStatus.js — mirrors the JobStatus enum in database/schema.prisma.

export const JOB_STATUSES = ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export const JOB_STATUS_LABELS = {
  REQUESTED: 'Waiting for a detailer',
  ACCEPTED: 'Accepted',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const JOB_STATUS_BADGE_CLASSES = {
  REQUESTED: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
  ACCEPTED: 'border-accent/30 bg-accent/10 text-accent',
  IN_PROGRESS: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  COMPLETED: 'border-zinc-700 bg-zinc-800 text-zinc-300',
  CANCELLED: 'border-red-500/30 bg-red-500/10 text-red-400',
};
