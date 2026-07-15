// prisma.js — the single PrismaClient instance shared across the backend.
//
// In development, nodemon reloads server.js on every file change; without a
// singleton, each reload would instantiate a new PrismaClient and open a new
// pool of database connections instead of reusing one. Stashing the client
// on globalThis survives module re-evaluation within the same process.

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

const prisma = globalForPrisma.__dezePrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__dezePrisma = prisma;
}

export default prisma;
