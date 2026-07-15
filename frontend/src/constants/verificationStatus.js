// constants/verificationStatus.js — mirrors the VerificationStatus enum in database/schema.prisma.

export const VERIFICATION_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'];

export const VERIFICATION_STATUS_BADGE_CLASSES = {
  PENDING: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
  APPROVED: 'border-accent/30 bg-accent/10 text-accent',
  REJECTED: 'border-red-500/30 bg-red-500/10 text-red-400',
};
