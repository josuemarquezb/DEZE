// database/seed.js — template for seeding local/test data.
// Run with: npm run seed (from backend/), or `node database/seed.js` directly.

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // TODO: create test users, listings, bookings, etc. once models exist.
  console.log('Seed script placeholder — no data seeded yet.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
