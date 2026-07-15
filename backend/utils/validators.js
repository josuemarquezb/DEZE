// utils/validators.js — small standalone input validators shared by controllers.
// Plain regex/length checks for now; swap for a schema library via
// middleware/validation.js if request shapes grow more complex.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

/** Checks that a value looks like a valid email address. */
export const isValidEmail = (email) => typeof email === 'string' && EMAIL_REGEX.test(email);

/** Checks that a password meets the minimum length requirement. */
export const isValidPassword = (password) =>
  typeof password === 'string' && password.length >= MIN_PASSWORD_LENGTH;

// --- DetailerProfile field validators ---
// Mirrors the ServiceType enum in database/schema.prisma — keep in sync.
export const SERVICE_TYPES = ['BASIC', 'FULL', 'CERAMIC', 'INTERIOR', 'EXTERIOR', 'OTHER'];

/** Checks that a single value is a valid ServiceType enum member. */
export const isValidServiceType = (value) => SERVICE_TYPES.includes(value);

/** Checks that a value is a non-empty array of valid, unique ServiceType members. */
export const isValidServiceTypes = (value) =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.every(isValidServiceType) &&
  new Set(value).size === value.length;

/** Checks that a value is a finite number greater than 0 (DetailerProfile.hourlyRate). */
export const isValidHourlyRate = (value) => typeof value === 'number' && Number.isFinite(value) && value > 0;

/** Checks that a value is a non-negative integer (DetailerProfile.yearsExperience). */
export const isValidYearsExperience = (value) => Number.isInteger(value) && value >= 0;

/** Checks that a value is a positive integer (DetailerProfile.serviceAreaRadius, in miles). */
export const isValidRadius = (value) => Number.isInteger(value) && value > 0;

/** Checks that a value is a valid latitude in decimal degrees. */
export const isValidLatitude = (value) =>
  typeof value === 'number' && Number.isFinite(value) && value >= -90 && value <= 90;

/** Checks that a value is a valid longitude in decimal degrees. */
export const isValidLongitude = (value) =>
  typeof value === 'number' && Number.isFinite(value) && value >= -180 && value <= 180;

// --- DetailJob field validators ---
// Mirrors the JobStatus enum in database/schema.prisma — keep in sync.
export const JOB_STATUSES = ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

/** Checks that a value is a valid JobStatus enum member. */
export const isValidJobStatus = (value) => JOB_STATUSES.includes(value);

/** Checks that a value is a non-empty, reasonably-sized string. */
export const isValidNonEmptyString = (value, maxLength = 255) =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;

/** Checks that a value is a plausible vehicle model year (DetailJob.vehicleYear). */
export const isValidVehicleYear = (value) =>
  Number.isInteger(value) && value >= 1900 && value <= new Date().getFullYear() + 1;

/** Checks that a value is a finite number greater than 0 (DetailJob.budget / agreedPrice). */
export const isValidBudget = (value) => typeof value === 'number' && Number.isFinite(value) && value > 0;

/** Checks that a value parses as a valid date (DetailJob.requestedDate). */
export const isValidDateString = (value) => typeof value === 'string' && !Number.isNaN(Date.parse(value));

/** Checks that a value is a HH:MM 24-hour time string (DetailJob.requestedTimeStart/End). */
export const isValidTimeString = (value) => typeof value === 'string' && /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);

// --- Review field validators ---

/** Checks that a value is a valid star rating (Review.rating). */
export const isValidRating = (value) => Number.isInteger(value) && value >= 1 && value <= 5;
