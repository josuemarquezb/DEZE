// config/db.js — Prisma client singleton used across the backend.
// Import this wherever database access is needed instead of
// instantiating a new PrismaClient in each file.

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;
