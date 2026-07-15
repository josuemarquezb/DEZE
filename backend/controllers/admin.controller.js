// controllers/admin.controller.js — internal admin tooling logic.
// Every route here is gated by requireAuth + requireAdmin (see routes/admin.js).
//
// Revenue notes: Stripe billing (subscriptions.controller.js, payments.controller.js,
// webhooks.controller.js) is stubbed out — there's no invoice/charge history to sum.
// So "subscription revenue" here is a current-snapshot MRR figure (active
// subscriptions × SUBSCRIPTION_PRICE), not a ledger of realized charges, and the
// monthly chart applies that same current MRR to every month rather than
// fabricating a billing history that doesn't exist. Job revenue, by contrast, is
// computed for real from DetailJob.agreedPrice/paymentStatus/completedAt.

import prisma from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { isValidNonEmptyString } from '../utils/validators.js';
import { notifyUser } from './notifications.controller.js';

const VERIFICATION_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'];
const JOB_STATUSES = ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const JOB_SORT_FIELDS = { date: 'createdAt', amount: 'agreedPrice', status: 'status' };
const DISPUTE_RESOLUTIONS = ['REFUND_CUSTOMER', 'RELEASE_TO_DETAILER', 'CANCEL_JOB'];
const SUBSCRIPTION_PRICE = 75;
const MONTHS_IN_CHART = 6;

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
const startOfNextMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 1);

const monthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const fullName = (user) => `${user.firstName} ${user.lastName}`;

const toJobSummary = (job) => ({
  id: job.id,
  jobTitle: job.jobTitle,
  status: job.status,
  serviceType: job.serviceType,
  paymentStatus: job.paymentStatus,
  budget: job.budget,
  agreedPrice: job.agreedPrice,
  requestedDate: job.requestedDate,
  createdAt: job.createdAt,
  completedAt: job.completedAt,
  customerName: job.customer ? fullName(job.customer.user) : null,
  detailerName: job.detailer ? fullName(job.detailer.user) : null,
});

const JOB_ADMIN_INCLUDE = {
  customer: { include: { user: { select: { firstName: true, lastName: true } } } },
  detailer: { include: { user: { select: { firstName: true, lastName: true } } } },
};

/** Sums PAID job revenue in a date range (inclusive start, exclusive end). Pass no args for all-time. */
const jobRevenueBetween = async (start, end) => {
  const agg = await prisma.detailJob.aggregate({
    where: {
      paymentStatus: 'PAID',
      ...(start || end ? { completedAt: { ...(start ? { gte: start } : {}), ...(end ? { lt: end } : {}) } } : {}),
    },
    _sum: { agreedPrice: true },
  });
  return agg._sum.agreedPrice ?? 0;
};

/** GET /api/admin/dashboard — high-level platform metrics (protected, admin). */
export const getDashboard = asyncHandler(async (req, res) => {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = startOfNextMonth(now);

  // Promise.all (not prisma.$transaction) because jobRevenueBetween is our own
  // async helper, not a raw PrismaPromise — $transaction's array form only
  // accepts direct Prisma query builder calls.
  const [
    totalDetailers,
    totalCustomers,
    jobsCompletedThisMonth,
    pendingVerifications,
    pendingDetailers,
    recentJobsRaw,
    recentDetailersRaw,
    activeSubscriptions,
    jobRevenueThisMonth,
  ] = await Promise.all([
    prisma.detailerProfile.count(),
    prisma.customerProfile.count(),
    prisma.detailJob.count({ where: { status: 'COMPLETED', completedAt: { gte: monthStart, lt: monthEnd } } }),
    prisma.detailerProfile.count({ where: { verificationStatus: 'PENDING' } }),
    prisma.detailerProfile.findMany({
      where: { verificationStatus: 'PENDING' },
      include: { user: { select: { firstName: true, lastName: true, email: true, phone: true, createdAt: true } } },
      orderBy: { createdAt: 'asc' },
      take: 5,
    }),
    prisma.detailJob.findMany({ include: JOB_ADMIN_INCLUDE, orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.detailerProfile.findMany({
      include: { user: { select: { firstName: true, lastName: true, email: true, createdAt: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    jobRevenueBetween(monthStart, monthEnd),
  ]);

  const subscriptionRevenue = activeSubscriptions * SUBSCRIPTION_PRICE;

  res.status(200).json({
    totalDetailers,
    totalCustomers,
    jobsCompletedThisMonth,
    revenueThisMonth: {
      total: jobRevenueThisMonth + subscriptionRevenue,
      jobRevenue: jobRevenueThisMonth,
      subscriptionRevenue,
    },
    pendingVerifications,
    // Full profile shape (not just name/email) so the frontend can feed these
    // straight into VerificationModal without a second fetch — same shape as
    // listDetailers' entries.
    pendingDetailers: pendingDetailers.map(({ user, ...profile }) => ({
      ...profile,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      joinedAt: user.createdAt,
    })),
    recentJobs: recentJobsRaw.map(toJobSummary),
    recentDetailers: recentDetailersRaw.map((p) => ({
      id: p.id,
      firstName: p.user.firstName,
      lastName: p.user.lastName,
      email: p.user.email,
      verificationStatus: p.verificationStatus,
      createdAt: p.user.createdAt,
    })),
  });
});

/** GET /api/admin/detailers — list all detailers for admin review/management. */
export const listDetailers = asyncHandler(async (req, res) => {
  const { verificationStatus, search } = req.query;

  if (verificationStatus !== undefined && !VERIFICATION_STATUSES.includes(verificationStatus)) {
    return res.status(400).json({ message: `verificationStatus must be one of: ${VERIFICATION_STATUSES.join(', ')}` });
  }

  const searchFilter = search
    ? {
        user: {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
      }
    : {};

  const detailers = await prisma.detailerProfile.findMany({
    where: { ...(verificationStatus ? { verificationStatus } : {}), ...searchFilter },
    include: {
      user: { select: { firstName: true, lastName: true, email: true, phone: true, createdAt: true } },
      detailJobs: { where: { status: 'COMPLETED' }, select: { id: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({
    detailers: detailers.map(({ detailJobs, user, ...profile }) => ({
      ...profile,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      joinedAt: user.createdAt,
      totalJobsCompleted: detailJobs.length,
    })),
    count: detailers.length,
  });
});

/** Approves or rejects a detailer's verification submission. */
export const verifyDetailer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!VERIFICATION_STATUSES.includes(status)) {
    return res.status(400).json({ message: `status must be one of: ${VERIFICATION_STATUSES.join(', ')}` });
  }

  const profile = await prisma.detailerProfile.findUnique({
    where: { id },
    include: { user: { select: { firstName: true } } },
  });
  if (!profile) {
    return res.status(404).json({ message: 'Detailer not found' });
  }

  const updated = await prisma.detailerProfile.update({
    where: { id },
    data: { verificationStatus: status },
  });

  console.log(`[admin] detailer verification updated — admin=${req.user.userId} detailer=${id} status=${status}`);

  if (status === 'APPROVED' && profile.verificationStatus !== 'APPROVED') {
    notifyUser(profile.userId, 'VERIFIED', { firstName: profile.user.firstName }, { email: true });
  }

  res.status(200).json({ detailer: updated });
});

/** GET /api/admin/detailers/:id/earnings — a detailer's full profile + earnings + recent jobs (admin). */
export const getDetailerEarnings = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const profile = await prisma.detailerProfile.findUnique({
    where: { id },
    include: { user: { select: { firstName: true, lastName: true, email: true, phone: true, createdAt: true } }, payout: true },
  });
  if (!profile) {
    return res.status(404).json({ message: 'Detailer not found' });
  }

  const [earnedAgg, recentJobsRaw] = await prisma.$transaction([
    prisma.detailJob.aggregate({
      where: { detailerId: id, status: 'COMPLETED', paymentStatus: 'PAID' },
      _sum: { agreedPrice: true },
    }),
    prisma.detailJob.findMany({
      where: { detailerId: id },
      include: JOB_ADMIN_INCLUDE,
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  const totalEarned = earnedAgg._sum.agreedPrice ?? 0;
  const totalPaidOut = profile.payout?.status === 'PAID' ? profile.payout.amount ?? 0 : 0;

  res.status(200).json({
    detailer: {
      id: profile.id,
      firstName: profile.user.firstName,
      lastName: profile.user.lastName,
      email: profile.user.email,
      phone: profile.user.phone,
      bio: profile.bio,
      serviceTypes: profile.serviceTypes,
      rating: profile.rating,
      totalReviews: profile.totalReviews,
      hourlyRate: profile.hourlyRate,
      yearsExperience: profile.yearsExperience,
      verificationStatus: profile.verificationStatus,
      subscriptionStatus: profile.subscriptionStatus,
      joinedAt: profile.user.createdAt,
    },
    earnings: {
      totalEarned,
      totalPaidOut,
      amountOwed: Math.max(0, totalEarned - totalPaidOut),
      paymentHistory: profile.payout
        ? [
            {
              amount: profile.payout.amount,
              status: profile.payout.status,
              scheduledAt: profile.payout.scheduledAt,
              paidAt: profile.payout.paidAt,
            },
          ]
        : [],
    },
    recentJobs: recentJobsRaw.map(toJobSummary),
  });
});

/** GET /api/admin/jobs — list all jobs for admin review/management. */
export const listJobs = asyncHandler(async (req, res) => {
  const { status, sortBy, sortDir } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 25));

  if (status !== undefined && !JOB_STATUSES.includes(status)) {
    return res.status(400).json({ message: `status must be one of: ${JOB_STATUSES.join(', ')}` });
  }

  const orderField = JOB_SORT_FIELDS[sortBy] || JOB_SORT_FIELDS.date;
  const direction = sortDir === 'asc' ? 'asc' : 'desc';

  const where = status ? { status } : undefined;

  const [jobs, total] = await prisma.$transaction([
    prisma.detailJob.findMany({
      where,
      include: JOB_ADMIN_INCLUDE,
      orderBy: { [orderField]: direction },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.detailJob.count({ where }),
  ]);

  res.status(200).json({ jobs: jobs.map(toJobSummary), total, page, limit });
});

/** GET /api/admin/revenue — platform revenue reporting (protected, admin). */
export const getRevenue = asyncHandler(async (req, res) => {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = startOfNextMonth(now);

  const [allTimeJobRevenue, jobRevenueThisMonth, activeSubscriptions, payoutAgg, detailerEarnedAgg, nextPayout] =
    await Promise.all([
      jobRevenueBetween(),
      jobRevenueBetween(monthStart, monthEnd),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.payout.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
      prisma.detailJob.aggregate({
        where: { paymentStatus: 'PAID', detailerId: { not: null } },
        _sum: { agreedPrice: true },
      }),
      prisma.payout.findFirst({
        where: { status: 'PENDING', scheduledAt: { gte: now } },
        orderBy: { scheduledAt: 'asc' },
        select: { scheduledAt: true },
      }),
    ]);

  const subscriptionRevenue = activeSubscriptions * SUBSCRIPTION_PRICE;
  const totalPaidOut = payoutAgg._sum.amount ?? 0;
  const totalOwed = Math.max(0, (detailerEarnedAgg._sum.agreedPrice ?? 0) - totalPaidOut);

  // Real month-by-month job revenue for the trailing MONTHS_IN_CHART months;
  // subscription revenue is the current MRR snapshot applied uniformly (see
  // file header) since no historical billing record exists to sum instead.
  const monthly = [];
  for (let i = MONTHS_IN_CHART - 1; i >= 0; i--) {
    const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const jobRevenue = await jobRevenueBetween(mStart, mEnd);
    monthly.push({
      month: monthKey(mStart),
      jobRevenue,
      subscriptionRevenue,
      total: jobRevenue + subscriptionRevenue,
    });
  }

  res.status(200).json({
    allTime: { total: allTimeJobRevenue + subscriptionRevenue, jobRevenue: allTimeJobRevenue, subscriptionRevenue },
    thisMonth: { total: jobRevenueThisMonth + subscriptionRevenue, jobRevenue: jobRevenueThisMonth, subscriptionRevenue },
    monthly,
    activeSubscriptions,
    payouts: { totalOwed, totalPaidOut, nextPayoutDate: nextPayout?.scheduledAt ?? null },
  });
});

/** GET /api/admin/users/search?q= — search users by name/email (protected, admin). */
export const searchUsers = asyncHandler(async (req, res) => {
  const q = req.query.q;
  if (!isValidNonEmptyString(q, 200)) {
    return res.status(400).json({ message: 'q query param is required' });
  }

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ],
    },
    select: { id: true, firstName: true, lastName: true, email: true, userType: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  res.status(200).json({ users, count: users.length });
});

/** POST /api/admin/disputes/:jobId — resolve a customer/detailer dispute (basic version, protected, admin). */
export const handleDispute = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const { resolution, notes } = req.body;

  if (!DISPUTE_RESOLUTIONS.includes(resolution)) {
    return res.status(400).json({ message: `resolution must be one of: ${DISPUTE_RESOLUTIONS.join(', ')}` });
  }
  if (notes !== undefined && notes !== null && (typeof notes !== 'string' || notes.length > 1000)) {
    return res.status(400).json({ message: 'notes must be a string of at most 1000 characters' });
  }

  const job = await prisma.detailJob.findUnique({ where: { id: jobId } });
  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }

  const data = {};
  if (resolution === 'REFUND_CUSTOMER') {
    data.paymentStatus = 'REFUNDED';
  } else if (resolution === 'RELEASE_TO_DETAILER') {
    data.paymentStatus = 'PAID';
  } else if (resolution === 'CANCEL_JOB') {
    data.status = 'CANCELLED';
    if (job.paymentStatus === 'PAID') data.paymentStatus = 'REFUNDED';
  }

  const updated = await prisma.detailJob.update({ where: { id: jobId }, data, include: JOB_ADMIN_INCLUDE });

  // NOTE: "basic version" per spec — this resolves the job's state but doesn't
  // persist a dispute record/history. Add a Dispute model if that's needed later.
  console.log(
    `[admin] dispute resolved — admin=${req.user.userId} job=${jobId} resolution=${resolution} notes=${notes || '(none)'}`
  );

  res.status(200).json({ job: toJobSummary(updated), resolution, notes: notes || null });
});

/** Triggers payout processing for eligible detailers. */
export const processPayouts = asyncHandler(async (req, res) => {
  res.status(501).json({ message: 'Not implemented: processPayouts' });
});
