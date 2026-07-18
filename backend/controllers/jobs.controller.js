// controllers/jobs.controller.js — DetailJob business logic: posting, browsing,
// accepting/declining, status transitions, and price negotiation.

import prisma from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { distanceInMiles } from '../utils/geo.js';
import {
  SERVICE_TYPES,
  JOB_STATUSES,
  isValidServiceType,
  isValidJobStatus,
  isValidNonEmptyString,
  isValidVehicleYear,
  isValidBudget,
  isValidDateString,
  isValidTimeString,
  isValidLatitude,
  isValidLongitude,
  isValidRadius,
} from '../utils/validators.js';
import { notifyUser } from './notifications.controller.js';
import { formatJobsAsGeoJSON } from '../utils/geoUtils.js';

const DEFAULT_SEARCH_RADIUS_MILES = 25;
const JOB_NOTIFICATION_RADIUS_MILES = 25;

// DEZE's fee model: 5% on top of the agreed price for the customer, 5% held
// back from the agreed price for the detailer — DEZE keeps 10% of every job.
const DEZE_FEE_RATE = 0.05;
const round2 = (n) => Math.round(n * 100) / 100;

/** Derives the customer/detailer fee split + totals from an agreed price. */
const computeJobFees = (agreedPrice) => {
  const customerFee = round2(agreedPrice * DEZE_FEE_RATE);
  const detailerFee = round2(agreedPrice * DEZE_FEE_RATE);
  return {
    customerFee,
    detailerFee,
    totalCustomerCost: round2(agreedPrice + customerFee),
    detailerPayout: round2(agreedPrice - detailerFee),
  };
};

// A job can only move to these statuses from its current one. REQUESTED and
// ACCEPTED are reached via createJob/acceptJob/declineJob, not this map.
const STATUS_TRANSITIONS = {
  REQUESTED: ['CANCELLED'],
  ACCEPTED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

const JOB_INCLUDE = {
  customer: { include: { user: { select: { firstName: true, lastName: true, profilePhoto: true } } } },
  detailer: { include: { user: { select: { firstName: true, lastName: true, profilePhoto: true } } } },
};

const findCustomerProfile = (userId) => prisma.customerProfile.findUnique({ where: { userId } });
const findDetailerProfile = (userId) => prisma.detailerProfile.findUnique({ where: { userId } });

/**
 * Notifies every verified, geolocated detailer whose own service-area radius
 * covers this job's location. Not awaited by its caller (see createJob) —
 * a slow/failed notification fan-out must never delay the job-posting response.
 */
const notifyNearbyDetailersOfJob = async (job) => {
  try {
    const candidates = await prisma.detailerProfile.findMany({
      where: { verificationStatus: 'APPROVED', latitude: { not: null }, longitude: { not: null } },
      select: { userId: true, latitude: true, longitude: true, serviceAreaRadius: true },
    });

    const nearby = candidates.filter(
      (d) => distanceInMiles(job.latitude, job.longitude, d.latitude, d.longitude) <= d.serviceAreaRadius
    );

    await Promise.all(
      nearby.map((d) =>
        notifyUser(
          d.userId,
          'JOB_POSTED',
          { jobId: job.id, jobTitle: job.jobTitle, locationAddress: job.locationAddress },
          { email: true }
        )
      )
    );

    console.log(`[jobs] notified ${nearby.length} nearby detailer(s) — job=${job.id}`);
  } catch (err) {
    console.error(`[jobs] notifyNearbyDetailersOfJob failed — job=${job.id}:`, err.message);
  }
};

/**
 * Shapes a DetailJob (+ relations) for API responses. Deliberately omits
 * customer/detailer email and phone (see toPublicDetailer in
 * detailers.controller.js for the same privacy rule) — in-app messaging is
 * how the two sides make contact. `customer.userId` / `detailer.userId` are
 * included so the frontend can tell "is this me?" without leaking anything
 * beyond what's already shown (name/photo).
 */
const toPublicJob = (job) => ({
  id: job.id,
  status: job.status,
  jobTitle: job.jobTitle,
  description: job.description,
  serviceType: job.serviceType,
  vehicleType: job.vehicleType,
  vehicleYear: job.vehicleYear,
  vehicleMake: job.vehicleMake,
  vehicleModel: job.vehicleModel,
  vehicleColor: job.vehicleColor,
  locationAddress: job.locationAddress,
  latitude: job.latitude,
  longitude: job.longitude,
  requestedDate: job.requestedDate,
  requestedTimeStart: job.requestedTimeStart,
  requestedTimeEnd: job.requestedTimeEnd,
  budget: job.budget,
  agreedPrice: job.agreedPrice,
  customerFee: job.customerFee,
  detailerFee: job.detailerFee,
  totalCustomerCost: job.totalCustomerCost,
  detailerPayout: job.detailerPayout,
  photosBefore: job.photosBefore,
  photosAfter: job.photosAfter,
  createdAt: job.createdAt,
  completedAt: job.completedAt,
  paymentStatus: job.paymentStatus,
  customer: job.customer
    ? {
        userId: job.customer.userId,
        firstName: job.customer.user.firstName,
        lastName: job.customer.user.lastName,
        profilePhoto: job.customer.user.profilePhoto,
      }
    : null,
  detailer: job.detailer
    ? {
        id: job.detailer.id,
        userId: job.detailer.userId,
        firstName: job.detailer.user.firstName,
        lastName: job.detailer.user.lastName,
        profilePhoto: job.detailer.user.profilePhoto,
        rating: job.detailer.rating,
        totalReviews: job.detailer.totalReviews,
      }
    : null,
});

/** Creates a new job request (customer). */
export const createJob = asyncHandler(async (req, res) => {
  const customerProfile = await findCustomerProfile(req.user.userId);
  if (!customerProfile) {
    return res.status(404).json({ message: 'Customer profile not found' });
  }

  const {
    jobTitle,
    description,
    serviceType,
    vehicleType,
    vehicleYear,
    vehicleMake,
    vehicleModel,
    vehicleColor,
    locationAddress,
    latitude,
    longitude,
    requestedDate,
    requestedTimeStart,
    requestedTimeEnd,
    budget,
  } = req.body;

  if (!isValidNonEmptyString(jobTitle, 200)) {
    return res.status(400).json({ message: 'jobTitle is required and must be at most 200 characters' });
  }
  if (!isValidServiceType(serviceType)) {
    return res.status(400).json({ message: `serviceType must be one of: ${SERVICE_TYPES.join(', ')}` });
  }
  if (!isValidNonEmptyString(vehicleType, 50)) {
    return res.status(400).json({ message: 'vehicleType is required' });
  }
  if (!isValidVehicleYear(vehicleYear)) {
    return res
      .status(400)
      .json({ message: `vehicleYear must be an integer between 1900 and ${new Date().getFullYear() + 1}` });
  }
  if (!isValidNonEmptyString(vehicleMake, 50)) {
    return res.status(400).json({ message: 'vehicleMake is required' });
  }
  if (!isValidNonEmptyString(vehicleModel, 50)) {
    return res.status(400).json({ message: 'vehicleModel is required' });
  }
  if (vehicleColor !== undefined && vehicleColor !== null && typeof vehicleColor !== 'string') {
    return res.status(400).json({ message: 'vehicleColor must be a string' });
  }
  if (!isValidNonEmptyString(locationAddress, 300)) {
    return res.status(400).json({ message: 'locationAddress is required' });
  }
  if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
    return res.status(400).json({ message: 'latitude and longitude are required and must be valid coordinates' });
  }
  if (!isValidTimeString(requestedTimeStart) || !isValidTimeString(requestedTimeEnd)) {
    return res.status(400).json({ message: 'requestedTimeStart and requestedTimeEnd must be in HH:MM format' });
  }
  if (requestedTimeEnd <= requestedTimeStart) {
    return res.status(400).json({ message: 'requestedTimeEnd must be after requestedTimeStart' });
  }
  if (!isValidDateString(requestedDate)) {
    return res.status(400).json({ message: 'requestedDate must be a valid date' });
  }

  const requestedDateTime = new Date(`${new Date(requestedDate).toISOString().slice(0, 10)}T${requestedTimeStart}:00`);
  if (requestedDateTime.getTime() <= Date.now()) {
    return res.status(400).json({ message: 'requestedDate/requestedTimeStart must be in the future' });
  }
  if (!isValidBudget(budget)) {
    return res.status(400).json({ message: 'budget must be a number greater than 0' });
  }
  if (description !== undefined && description !== null && (typeof description !== 'string' || description.length > 2000)) {
    return res.status(400).json({ message: 'description must be a string of at most 2000 characters' });
  }

  const job = await prisma.detailJob.create({
    data: {
      customerId: customerProfile.id,
      jobTitle,
      description: description || null,
      serviceType,
      vehicleType,
      vehicleYear,
      vehicleMake,
      vehicleModel,
      vehicleColor: vehicleColor || null,
      locationAddress,
      latitude,
      longitude,
      requestedDate: new Date(requestedDate),
      requestedTimeStart,
      requestedTimeEnd,
      budget,
    },
    include: JOB_INCLUDE,
  });

  console.log(`[jobs] job created — job=${job.id} customer=${customerProfile.id}`);

  notifyNearbyDetailersOfJob(job);

  res.status(201).json({ job: toPublicJob(job) });
});

/** Lists open jobs near the authenticated detailer (detailer). */
export const getNearbyJobs = asyncHandler(async (req, res) => {
  const detailerProfile = await findDetailerProfile(req.user.userId);
  if (!detailerProfile) {
    return res.status(404).json({ message: 'Detailer profile not found' });
  }

  const lat = req.query.lat !== undefined ? Number(req.query.lat) : detailerProfile.latitude;
  const lng = req.query.lng !== undefined ? Number(req.query.lng) : detailerProfile.longitude;
  const radius = req.query.radius !== undefined ? Number(req.query.radius) : detailerProfile.serviceAreaRadius;

  if (!isValidLatitude(lat) || !isValidLongitude(lng)) {
    return res.status(400).json({
      message: 'lat and lng are required (as query params, or set on your detailer profile) and must be valid coordinates',
    });
  }
  if (!isValidRadius(radius)) {
    return res.status(400).json({ message: 'radius must be a positive integer' });
  }

  const candidates = await prisma.detailJob.findMany({
    where: { status: 'REQUESTED', detailerId: null },
    include: JOB_INCLUDE,
  });

  const results = candidates
    .map((job) => ({ job, distanceMiles: distanceInMiles(lat, lng, job.latitude, job.longitude) }))
    .filter((entry) => entry.distanceMiles <= radius)
    .sort((a, b) => a.distanceMiles - b.distanceMiles)
    .map((entry) => ({ ...toPublicJob(entry.job), distanceMiles: Math.round(entry.distanceMiles * 10) / 10 }));

  // The map view (JobsMap.jsx) asks for GeoJSON directly so it can hand the
  // response straight to a Mapbox GL GeoJSON source; every other consumer
  // (JobList, JobCard) keeps getting the plain { jobs, count } shape.
  if (req.query.format === 'geojson') {
    return res.status(200).json(formatJobsAsGeoJSON(results));
  }

  res.status(200).json({ jobs: results, count: results.length });
});

/** Searches open jobs by service type, date, and budget range (detailer). */
export const searchJobs = asyncHandler(async (req, res) => {
  const { serviceType, date } = req.query;
  const minBudget = req.query.minBudget !== undefined ? Number(req.query.minBudget) : undefined;
  const maxBudget = req.query.maxBudget !== undefined ? Number(req.query.maxBudget) : undefined;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));

  if (serviceType !== undefined && !isValidServiceType(serviceType)) {
    return res.status(400).json({ message: 'serviceType is not a valid ServiceType' });
  }
  if (minBudget !== undefined && (!Number.isFinite(minBudget) || minBudget < 0)) {
    return res.status(400).json({ message: 'minBudget must be a non-negative number' });
  }
  if (maxBudget !== undefined && (!Number.isFinite(maxBudget) || maxBudget < 0)) {
    return res.status(400).json({ message: 'maxBudget must be a non-negative number' });
  }

  let dateFilter;
  if (date !== undefined) {
    if (!isValidDateString(date)) {
      return res.status(400).json({ message: 'date must be a valid date' });
    }
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    dateFilter = { gte: start, lte: end };
  }

  const where = {
    status: 'REQUESTED',
    detailerId: null,
    ...(serviceType ? { serviceType } : {}),
    ...(dateFilter ? { requestedDate: dateFilter } : {}),
    ...(minBudget !== undefined || maxBudget !== undefined
      ? {
          budget: {
            ...(minBudget !== undefined ? { gte: minBudget } : {}),
            ...(maxBudget !== undefined ? { lte: maxBudget } : {}),
          },
        }
      : {}),
  };

  const [jobs, total] = await prisma.$transaction([
    prisma.detailJob.findMany({
      where,
      include: JOB_INCLUDE,
      orderBy: { requestedDate: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.detailJob.count({ where }),
  ]);

  res.status(200).json({ jobs: jobs.map(toPublicJob), total, page, limit });
});

/** Returns a single job's details by id. */
export const getJobById = asyncHandler(async (req, res) => {
  const job = await prisma.detailJob.findUnique({ where: { id: req.params.id }, include: JOB_INCLUDE });

  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }

  res.status(200).json({ job: toPublicJob(job) });
});

/** Accepts a job request, assigning the authenticated detailer to it (detailer). */
export const acceptJob = asyncHandler(async (req, res) => {
  const detailerProfile = await findDetailerProfile(req.user.userId);
  if (!detailerProfile) {
    return res.status(404).json({ message: 'Detailer profile not found' });
  }

  const job = await prisma.detailJob.findUnique({ where: { id: req.params.id } });
  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }
  if (job.status !== 'REQUESTED' || job.detailerId) {
    return res.status(409).json({ message: 'Job is no longer available to accept' });
  }

  // Atomic accept: the where clause re-checks REQUESTED/unassigned at write
  // time so two detailers racing to accept the same job can't both win.
  const result = await prisma.detailJob.updateMany({
    where: { id: job.id, status: 'REQUESTED', detailerId: null },
    data: { status: 'ACCEPTED', detailerId: detailerProfile.id },
  });

  if (result.count === 0) {
    return res.status(409).json({ message: 'Job is no longer available to accept' });
  }

  const updated = await prisma.detailJob.findUnique({ where: { id: job.id }, include: JOB_INCLUDE });

  console.log(`[jobs] job accepted — job=${job.id} detailer=${detailerProfile.id}`);

  notifyUser(
    updated.customer.userId,
    'JOB_ACCEPTED',
    {
      jobId: updated.id,
      jobTitle: updated.jobTitle,
      detailerFirstName: updated.detailer.user.firstName,
      detailerLastName: updated.detailer.user.lastName,
    },
    { email: true }
  );

  res.status(200).json({ job: toPublicJob(updated) });
});

/**
 * Declines a job request (detailer). A job in REQUESTED/unassigned state was
 * never "offered" to a specific detailer (it's open for anyone to browse and
 * accept), so declining it here is just an acknowledgement — nothing to
 * persist. Declining a job this detailer has already ACCEPTED backs them out
 * and reopens it for other detailers.
 */
export const declineJob = asyncHandler(async (req, res) => {
  const detailerProfile = await findDetailerProfile(req.user.userId);
  if (!detailerProfile) {
    return res.status(404).json({ message: 'Detailer profile not found' });
  }

  const job = await prisma.detailJob.findUnique({ where: { id: req.params.id } });
  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }

  if (job.detailerId === detailerProfile.id && job.status === 'ACCEPTED') {
    const updated = await prisma.detailJob.update({
      where: { id: job.id },
      data: { status: 'REQUESTED', detailerId: null },
      include: JOB_INCLUDE,
    });
    console.log(`[jobs] job declined (backed out) — job=${job.id} detailer=${detailerProfile.id}`);
    return res.status(200).json({ job: toPublicJob(updated) });
  }

  if (job.status === 'REQUESTED' && !job.detailerId) {
    const full = await prisma.detailJob.findUnique({ where: { id: job.id }, include: JOB_INCLUDE });
    return res.status(200).json({ job: toPublicJob(full) });
  }

  return res.status(409).json({ message: 'Job cannot be declined in its current state' });
});

/** Updates a job's status (e.g. IN_PROGRESS, COMPLETED, CANCELLED). */
export const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!isValidJobStatus(status)) {
    return res.status(400).json({ message: `status must be one of: ${JOB_STATUSES.join(', ')}` });
  }

  const job = await prisma.detailJob.findUnique({ where: { id: req.params.id } });
  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }

  const allowedNextStatuses = STATUS_TRANSITIONS[job.status] || [];
  if (!allowedNextStatuses.includes(status)) {
    return res.status(409).json({ message: `Cannot change status from ${job.status} to ${status}` });
  }

  let authorized = false;
  if (status === 'IN_PROGRESS' || status === 'COMPLETED') {
    // Only the assigned detailer can start or finish the job.
    if (req.user.userType === 'DETAILER') {
      const detailerProfile = await findDetailerProfile(req.user.userId);
      authorized = !!detailerProfile && job.detailerId === detailerProfile.id;
    }
  } else if (status === 'CANCELLED') {
    // Either side of the job can cancel it, but only their own.
    if (req.user.userType === 'CUSTOMER') {
      const customerProfile = await findCustomerProfile(req.user.userId);
      authorized = !!customerProfile && job.customerId === customerProfile.id;
    } else if (req.user.userType === 'DETAILER') {
      const detailerProfile = await findDetailerProfile(req.user.userId);
      authorized = !!detailerProfile && job.detailerId === detailerProfile.id;
    }
  }

  if (!authorized) {
    // Admin override — e.g. AdminJobs' "Mark completed" action. Looked up lazily
    // (not on every request) since this is the rare fallback path.
    const requester = await prisma.user.findUnique({ where: { id: req.user.userId }, select: { isAdmin: true } });
    authorized = !!requester?.isAdmin;
  }

  if (!authorized) {
    return res.status(403).json({ message: "Not authorized to change this job's status" });
  }

  const data = { status };
  if (status === 'COMPLETED') {
    data.completedAt = new Date();
  }

  const updated = await prisma.detailJob.update({ where: { id: job.id }, data, include: JOB_INCLUDE });

  console.log(`[jobs] job status updated — job=${job.id} ${job.status} -> ${status}`);

  if (status === 'COMPLETED') {
    notifyUser(
      updated.customer.userId,
      'JOB_COMPLETED',
      { jobId: updated.id, jobTitle: updated.jobTitle },
      { email: true }
    );
  }

  res.status(200).json({ job: toPublicJob(updated) });
});

/** Proposes/updates the agreed price for a job (detailer). */
export const proposePrice = asyncHandler(async (req, res) => {
  const { proposedPrice } = req.body;
  if (!isValidBudget(proposedPrice)) {
    return res.status(400).json({ message: 'proposedPrice must be a number greater than 0' });
  }

  const detailerProfile = await findDetailerProfile(req.user.userId);
  if (!detailerProfile) {
    return res.status(404).json({ message: 'Detailer profile not found' });
  }

  const job = await prisma.detailJob.findUnique({ where: { id: req.params.id } });
  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }

  if (job.detailerId !== detailerProfile.id) {
    return res.status(403).json({ message: 'Only the detailer assigned to this job can propose a price' });
  }
  if (!['ACCEPTED', 'IN_PROGRESS'].includes(job.status)) {
    return res.status(409).json({ message: 'Price can only be proposed on an accepted or in-progress job' });
  }

  const updated = await prisma.detailJob.update({
    where: { id: job.id },
    data: { agreedPrice: proposedPrice, ...computeJobFees(proposedPrice) },
    include: JOB_INCLUDE,
  });

  console.log(`[jobs] price proposed — job=${job.id} detailer=${detailerProfile.id} price=${proposedPrice}`);

  res.status(200).json({ job: toPublicJob(updated) });
});

/** Uploads before/after photos for a job. */
export const uploadPhotos = asyncHandler(async (req, res) => {
  res.status(501).json({ message: 'Not implemented: uploadPhotos' });
});

/** Lists the authenticated customer's own job requests (customer). */
export const getMyRequests = asyncHandler(async (req, res) => {
  const customerProfile = await findCustomerProfile(req.user.userId);
  if (!customerProfile) {
    return res.status(404).json({ message: 'Customer profile not found' });
  }

  const jobs = await prisma.detailJob.findMany({
    where: { customerId: customerProfile.id },
    include: JOB_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({ jobs: jobs.map(toPublicJob), count: jobs.length });
});

/** Lists jobs the authenticated detailer has accepted (detailer). */
export const getMyAccepted = asyncHandler(async (req, res) => {
  const detailerProfile = await findDetailerProfile(req.user.userId);
  if (!detailerProfile) {
    return res.status(404).json({ message: 'Detailer profile not found' });
  }

  const jobs = await prisma.detailJob.findMany({
    where: { detailerId: detailerProfile.id },
    include: JOB_INCLUDE,
    orderBy: { requestedDate: 'asc' },
  });

  res.status(200).json({ jobs: jobs.map(toPublicJob), count: jobs.length });
});

/** Returns the authenticated user's full job history (customer or detailer). */
export const getHistory = asyncHandler(async (req, res) => {
  res.status(501).json({ message: 'Not implemented: getHistory' });
});
