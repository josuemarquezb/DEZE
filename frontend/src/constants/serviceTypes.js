// constants/serviceTypes.js — mirrors the ServiceType enum in database/schema.prisma.

export const SERVICE_TYPES = ['BASIC', 'FULL', 'CERAMIC', 'INTERIOR', 'EXTERIOR', 'OTHER'];

export const SERVICE_TYPE_LABELS = {
  BASIC: 'Basic Wash',
  FULL: 'Full Detail',
  CERAMIC: 'Ceramic Coating',
  INTERIOR: 'Interior Only',
  EXTERIOR: 'Exterior Only',
  OTHER: 'Other',
};
