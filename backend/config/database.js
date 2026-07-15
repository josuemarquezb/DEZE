// config/database.js — connection lifecycle for the Prisma-backed PostgreSQL
// database. Call connectDB() once on server startup and disconnectDB() on
// graceful shutdown (see server.js).

import prisma from '../prisma.js';

/**
 * connectDB — opens (and verifies) the Prisma connection to PostgreSQL.
 * Prisma normally connects lazily on first query, so this issues a trivial
 * round-trip up front to fail fast if the database is unreachable.
 *
 * @returns {Promise<import('@prisma/client').PrismaClient>} the connected client
 */
export const connectDB = async () => {
  try {
    await prisma.$connect();
    // Confirms the connection actually works, not just that $connect() resolved.
    await prisma.$queryRaw`SELECT 1`;
    console.log('Connected to DEZE database');
    return prisma;
  } catch (error) {
    console.error('Failed to connect to DEZE database:', error.message);
    throw error;
  }
};

/** disconnectDB — gracefully closes the Prisma client's connection pool. */
export const disconnectDB = async () => {
  await prisma.$disconnect();
  console.log('Disconnected from DEZE database');
};
