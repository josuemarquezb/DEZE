// controllers/detailers.controller.js — DetailerProfile business logic.

import prisma from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { distanceInMiles } from '../utils/geo.js';
import {
  isValidEmail,
  isValidServiceTypes,
  isValidServiceType,
  isValidHourlyRate,
  isValidYearsExperience,
  isValidRadius,
  isValidLatitude,
  isValidLongitude,
} from '../utils/validators.js';

const DEFAULT_SEARCH_RADIUS_MILES = 25;

const PUBLIC_USER_SELECT = { firstName: true, lastName: true, profilePhoto: true };

/** Shapes a DetailerProfile (+ user) for public consumption — no email/phone. */
const toPublicDetailer = (profile) => ({
  id: profile.id,
  firstName: profile.user.firstName,
  lastName: profile.user.lastName,
  profilePhoto: profile.user.profilePhoto,
  bio: profile.bio,
  serviceTypes: profile.serviceTypes,
  rating: profile.rating,
  totalReviews: profile.totalReviews,
  hourlyRate: profile.hourlyRate,
  yearsExperience: profile.yearsExperience,
  equipmentPhotos: profile.equipmentPhotos,
  verificationStatus: profile.verificationStatus,
  serviceAreaRadius: profile.serviceAreaRadius,
  latitude: profile.latitude,
  longitude: profile.longitude,
  createdAt: profile.createdAt,
});

/** Shapes a review for public display, attaching the reviewing customer's first name. */
const toPublicReview = (review) => ({
  id: review.id,
  rating: review.rating,
  comment: review.comment,
  createdAt: review.createdAt,
  customerFirstName: review.customer.user.firstName,
});

const findProfileByUserId = (userId) => prisma.detailerProfile.findUnique({ where: { userId } });

/** GET /api/detailers/:id — a detailer's public profile, with ratings and recent reviews. */
export const getPublicProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const profile = await prisma.detailerProfile.findUnique({
    where: { id },
    include: {
      user: { select: PUBLIC_USER_SELECT },
      reviews: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { customer: { include: { user: { select: { firstName: true } } } } },
      },
    },
  });

  if (!profile) {
    return res.status(404).json({ message: 'Detailer not found' });
  }

  res.status(200).json({
    detailer: toPublicDetailer(profile),
    reviews: profile.reviews.map(toPublicReview),
  });
});

/** PUT /api/detailers/me — updates the authenticated detailer's own profile. */
export const updateMe = asyncHandler(async (req, res) => {
  const profile = await findProfileByUserId(req.user.userId);
  if (!profile) {
    return res.status(404).json({ message: 'Detailer profile not found' });
  }

  const {
    bio,
    serviceTypes,
    hourlyRate,
    yearsExperience,
    latitude,
    longitude,
    serviceAreaRadius,
    email,
  } = req.body;

  const profileData = {};

  if (bio !== undefined) {
    if (typeof bio !== 'string' || bio.length > 2000) {
      return res.status(400).json({ message: 'bio must be a string of at most 2000 characters' });
    }
    profileData.bio = bio;
  }

  if (serviceTypes !== undefined) {
    if (!isValidServiceTypes(serviceTypes)) {
      return res.status(400).json({
        message: 'serviceTypes must be a non-empty array of unique values from BASIC, FULL, CERAMIC, INTERIOR, EXTERIOR, OTHER',
      });
    }
    profileData.serviceTypes = serviceTypes;
  }

  if (hourlyRate !== undefined) {
    if (hourlyRate !== null && !isValidHourlyRate(hourlyRate)) {
      return res.status(400).json({ message: 'hourlyRate must be a number greater than 0' });
    }
    profileData.hourlyRate = hourlyRate;
  }

  if (yearsExperience !== undefined) {
    if (yearsExperience !== null && !isValidYearsExperience(yearsExperience)) {
      return res.status(400).json({ message: 'yearsExperience must be a non-negative integer' });
    }
    profileData.yearsExperience = yearsExperience;
  }

  if (latitude !== undefined) {
    if (!isValidLatitude(latitude)) {
      return res.status(400).json({ message: 'latitude must be a number between -90 and 90' });
    }
    profileData.latitude = latitude;
  }

  if (longitude !== undefined) {
    if (!isValidLongitude(longitude)) {
      return res.status(400).json({ message: 'longitude must be a number between -180 and 180' });
    }
    profileData.longitude = longitude;
  }

  if (serviceAreaRadius !== undefined) {
    if (!isValidRadius(serviceAreaRadius)) {
      return res.status(400).json({ message: 'serviceAreaRadius must be a positive integer' });
    }
    profileData.serviceAreaRadius = serviceAreaRadius;
  }

  if (email !== undefined) {
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    const normalizedEmail = email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing && existing.id !== req.user.userId) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }
  }

  if (email !== undefined) {
    await prisma.user.update({ where: { id: req.user.userId }, data: { email: email.toLowerCase() } });
  }

  const updatedProfile = await prisma.detailerProfile.update({
    where: { userId: req.user.userId },
    data: profileData,
    include: { user: { select: { ...PUBLIC_USER_SELECT, email: true, phone: true } } },
  });

  console.log(`[detailers] profile updated — detailer=${updatedProfile.id}`);

  res.status(200).json({
    detailer: {
      ...toPublicDetailer(updatedProfile),
      email: updatedProfile.user.email,
      phone: updatedProfile.user.phone,
      verificationDocs: updatedProfile.verificationDocs,
    },
  });
});

/** GET /api/detailers/me — the authenticated detailer's own full profile (private view). */
export const getMe = asyncHandler(async (req, res) => {
  const profile = await prisma.detailerProfile.findUnique({
    where: { userId: req.user.userId },
    include: { user: { select: { ...PUBLIC_USER_SELECT, email: true, phone: true } } },
  });

  if (!profile) {
    return res.status(404).json({ message: 'Detailer profile not found' });
  }

  res.status(200).json({
    detailer: {
      ...toPublicDetailer(profile),
      email: profile.user.email,
      phone: profile.user.phone,
      verificationDocs: profile.verificationDocs,
    },
  });
});

/**
 * POST /api/detailers/verify — (re)submits a detailer for verification review.
 * Verification document uploads themselves happen via POST /api/photos/verification
 * (see controllers/photoController.js), which appends to DetailerProfile.verificationDocs;
 * this endpoint just flips the status back to PENDING once the detailer is ready for review.
 */
export const submitVerification = asyncHandler(async (req, res) => {
  const profile = await findProfileByUserId(req.user.userId);
  if (!profile) {
    return res.status(404).json({ message: 'Detailer profile not found' });
  }

  const updated = await prisma.detailerProfile.update({
    where: { userId: req.user.userId },
    data: { verificationStatus: 'PENDING' },
  });

  console.log(`[detailers] verification submitted — detailer=${updated.id} docs=${profile.verificationDocs.length}`);

  res.status(200).json({ verificationStatus: updated.verificationStatus });
});

/** GET /api/detailers/nearby — finds detailers near a point (query: lat, lng, radius, serviceType). */
export const getNearby = asyncHandler(async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const radius = req.query.radius !== undefined ? Number(req.query.radius) : DEFAULT_SEARCH_RADIUS_MILES;
  const { serviceType } = req.query;

  if (!isValidLatitude(lat) || !isValidLongitude(lng)) {
    return res.status(400).json({ message: 'lat and lng query params are required and must be valid coordinates' });
  }
  if (!isValidRadius(radius)) {
    return res.status(400).json({ message: 'radius must be a positive integer' });
  }
  if (serviceType !== undefined && !isValidServiceType(serviceType)) {
    return res.status(400).json({ message: 'serviceType is not a valid ServiceType' });
  }

  const candidates = await prisma.detailerProfile.findMany({
    where: {
      verificationStatus: 'APPROVED',
      latitude: { not: null },
      longitude: { not: null },
      ...(serviceType ? { serviceTypes: { has: serviceType } } : {}),
    },
    include: { user: { select: PUBLIC_USER_SELECT } },
  });

  const results = candidates
    .map((profile) => ({
      ...toPublicDetailer(profile),
      distanceMiles: Math.round(distanceInMiles(lat, lng, profile.latitude, profile.longitude) * 10) / 10,
    }))
    .filter((profile) => profile.distanceMiles <= radius)
    .sort((a, b) => a.distanceMiles - b.distanceMiles);

  res.status(200).json({ detailers: results, count: results.length });
});

/** GET /api/detailers/search — searches/filters detailers (query: serviceType, minRating, sortBy, page, limit). */
export const search = asyncHandler(async (req, res) => {
  const { serviceType, minRating, sortBy } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));

  if (serviceType !== undefined && !isValidServiceType(serviceType)) {
    return res.status(400).json({ message: 'serviceType is not a valid ServiceType' });
  }

  const minRatingNum = minRating !== undefined ? Number(minRating) : undefined;
  if (minRatingNum !== undefined && (!Number.isFinite(minRatingNum) || minRatingNum < 0 || minRatingNum > 5)) {
    return res.status(400).json({ message: 'minRating must be a number between 0 and 5' });
  }

  const where = {
    verificationStatus: 'APPROVED',
    ...(serviceType ? { serviceTypes: { has: serviceType } } : {}),
    ...(minRatingNum !== undefined ? { rating: { gte: minRatingNum } } : {}),
  };

  const orderBy =
    sortBy === 'hourlyRate' ? { hourlyRate: 'asc' } : sortBy === 'experience' ? { yearsExperience: 'desc' } : { rating: 'desc' };

  const [profiles, total] = await prisma.$transaction([
    prisma.detailerProfile.findMany({
      where,
      include: { user: { select: PUBLIC_USER_SELECT } },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.detailerProfile.count({ where }),
  ]);

  res.status(200).json({
    detailers: profiles.map(toPublicDetailer),
    total,
    page,
    limit,
  });
});

/** GET /api/detailers/me/stats — the authenticated detailer's own stats. */
export const getMyStats = asyncHandler(async (req, res) => {
  const profile = await findProfileByUserId(req.user.userId);
  if (!profile) {
    return res.status(404).json({ message: 'Detailer profile not found' });
  }

  const [totalJobsCompleted, ratingAgg, earningsAgg] = await prisma.$transaction([
    prisma.detailJob.count({ where: { detailerId: profile.id, status: 'COMPLETED' } }),
    prisma.review.aggregate({ where: { detailerId: profile.id }, _avg: { rating: true }, _count: { rating: true } }),
    prisma.detailJob.aggregate({
      where: { detailerId: profile.id, status: 'COMPLETED', paymentStatus: 'PAID' },
      _sum: { agreedPrice: true },
    }),
  ]);

  res.status(200).json({
    totalJobsCompleted,
    averageRating: ratingAgg._avg.rating ?? 0,
    totalReviews: ratingAgg._count.rating,
    totalEarnings: earningsAgg._sum.agreedPrice ?? 0,
    verificationStatus: profile.verificationStatus,
    subscriptionStatus: profile.subscriptionStatus,
  });
});
