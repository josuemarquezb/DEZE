// database/seed.js — seeds the DEZE database with realistic test data:
// 3 customers, 3 detailers, 2 completed jobs, 5 chat messages, 2 reviews,
// and a subscription per detailer.
//
// Run with:
//   npm run db:seed        (from backend/)
//   npm run seed           (from database/, after `npm install` here)
//   node seed.js           (from database/ directly)
//
// Every write uses upsert/find-or-create so this script is safe to re-run
// against a database that's already been seeded.

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SEED_PASSWORD = 'password123';

async function upsertCustomer({ email, firstName, lastName, phone, passwordHash }) {
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: passwordHash,
      userType: 'CUSTOMER',
      firstName,
      lastName,
      phone,
      customerProfile: {
        create: {
          defaultAddress: '123 Main St, Austin, TX 78701',
          preferredServiceTypes: ['FULL', 'INTERIOR'],
        },
      },
    },
    include: { customerProfile: true },
  });
}

async function upsertDetailer({
  email,
  firstName,
  lastName,
  bio,
  serviceTypes,
  hourlyRate,
  yearsExperience,
  latitude,
  longitude,
  passwordHash,
}) {
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: passwordHash,
      userType: 'DETAILER',
      firstName,
      lastName,
      detailerProfile: {
        create: {
          bio,
          serviceTypes,
          hourlyRate,
          yearsExperience,
          verificationStatus: 'APPROVED',
          latitude,
          longitude,
        },
      },
    },
    include: { detailerProfile: true },
  });
}

async function findOrCreateJob(where, data) {
  const existing = await prisma.detailJob.findFirst({ where });
  if (existing) return existing;
  return prisma.detailJob.create({ data });
}

async function seedMessagesIfMissing(jobId, messages) {
  const existingCount = await prisma.message.count({ where: { jobId } });
  if (existingCount > 0) return;
  for (const message of messages) {
    await prisma.message.create({ data: { jobId, ...message } });
  }
}

async function seedReviewIfMissing({ jobId, customerId, detailerId, rating, comment }) {
  const existing = await prisma.review.findUnique({ where: { jobId } });
  if (existing) return existing;

  const review = await prisma.review.create({
    data: { jobId, customerId, detailerId, rating, comment },
  });

  // Keep DetailerProfile.rating/totalReviews consistent with seeded reviews.
  // (In the real app this recalculation happens in reviews.controller.js.)
  await prisma.detailerProfile.update({
    where: { id: detailerId },
    data: { rating, totalReviews: { increment: 1 } },
  });

  return review;
}

async function main() {
  console.log('Seeding DEZE database...');

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  // --- Customers ---
  const customers = await Promise.all(
    [
      { email: 'alice.customer@example.com', firstName: 'Alice', lastName: 'Nguyen', phone: '512-555-0101' },
      { email: 'ben.customer@example.com', firstName: 'Ben', lastName: 'Turner', phone: '512-555-0102' },
      { email: 'chloe.customer@example.com', firstName: 'Chloe', lastName: 'Ramirez', phone: '512-555-0103' },
    ].map((data) => upsertCustomer({ ...data, passwordHash }))
  );

  // --- Detailers ---
  const detailers = await Promise.all(
    [
      {
        email: 'marco.detailer@example.com',
        firstName: 'Marco',
        lastName: 'Silva',
        bio: 'Mobile detailing specialist with 6 years of experience — ceramic coatings a specialty.',
        serviceTypes: ['BASIC', 'FULL', 'CERAMIC'],
        hourlyRate: 45,
        yearsExperience: 6,
        latitude: 30.2672,
        longitude: -97.7431,
      },
      {
        email: 'priya.detailer@example.com',
        firstName: 'Priya',
        lastName: 'Patel',
        bio: 'Interior deep-clean expert — pet hair and stain removal specialist.',
        serviceTypes: ['INTERIOR', 'BASIC'],
        hourlyRate: 35,
        yearsExperience: 3,
        latitude: 30.2849,
        longitude: -97.7341,
      },
      {
        email: 'jake.detailer@example.com',
        firstName: 'Jake',
        lastName: 'Moore',
        bio: 'Full-service detailing and ceramic coatings for trucks and SUVs.',
        serviceTypes: ['FULL', 'CERAMIC', 'EXTERIOR'],
        hourlyRate: 55,
        yearsExperience: 9,
        latitude: 30.25,
        longitude: -97.75,
      },
    ].map((data) => upsertDetailer({ ...data, passwordHash }))
  );

  const [alice, ben] = customers;
  const [marco, priya] = detailers;

  // --- Jobs ---
  // Both are COMPLETED so each can carry exactly one review (Review.jobId is unique).
  const job1 = await findOrCreateJob(
    { jobTitle: 'Full Detail — Toyota Camry', customerId: alice.customerProfile.id },
    {
      customerId: alice.customerProfile.id,
      detailerId: marco.detailerProfile.id,
      status: 'COMPLETED',
      jobTitle: 'Full Detail — Toyota Camry',
      description: 'Full interior + exterior detail before a road trip.',
      serviceType: 'FULL',
      vehicleType: 'SEDAN',
      vehicleYear: 2021,
      vehicleMake: 'Toyota',
      vehicleModel: 'Camry',
      vehicleColor: 'Silver',
      locationAddress: '123 Main St, Austin, TX 78701',
      latitude: 30.2672,
      longitude: -97.7431,
      requestedDate: new Date('2026-06-15T00:00:00.000Z'),
      requestedTimeStart: '09:00',
      requestedTimeEnd: '11:00',
      budget: 150,
      agreedPrice: 140,
      customerFee: 7,
      detailerFee: 7,
      totalCustomerCost: 147,
      detailerPayout: 133,
      paymentStatus: 'PAID',
      paymentId: 'pi_test_job1',
      completedAt: new Date('2026-06-15T11:15:00.000Z'),
    }
  );

  const job2 = await findOrCreateJob(
    { jobTitle: 'Interior Refresh — Honda CR-V', customerId: ben.customerProfile.id },
    {
      customerId: ben.customerProfile.id,
      detailerId: priya.detailerProfile.id,
      status: 'COMPLETED',
      jobTitle: 'Interior Refresh — Honda CR-V',
      description: 'Pet hair removal and interior shampoo.',
      serviceType: 'INTERIOR',
      vehicleType: 'SUV',
      vehicleYear: 2019,
      vehicleMake: 'Honda',
      vehicleModel: 'CR-V',
      vehicleColor: 'Blue',
      locationAddress: '456 Oak Ave, Austin, TX 78702',
      latitude: 30.2849,
      longitude: -97.7341,
      requestedDate: new Date('2026-06-20T00:00:00.000Z'),
      requestedTimeStart: '13:00',
      requestedTimeEnd: '15:00',
      budget: 90,
      agreedPrice: 85,
      customerFee: 4.25,
      detailerFee: 4.25,
      totalCustomerCost: 89.25,
      detailerPayout: 80.75,
      paymentStatus: 'PAID',
      paymentId: 'pi_test_job2',
      completedAt: new Date('2026-06-20T15:05:00.000Z'),
    }
  );

  // --- Messages (3 on job1, 2 on job2) ---
  await seedMessagesIfMissing(job1.id, [
    {
      senderId: alice.id,
      senderType: 'CUSTOMER',
      recipientId: marco.id,
      messageText: "Hi Marco, looking forward to the detail tomorrow. I'll be parked in the driveway.",
      readAt: new Date('2026-06-14T18:05:00.000Z'),
    },
    {
      senderId: marco.id,
      senderType: 'DETAILER',
      recipientId: alice.id,
      messageText: 'Sounds good, see you at 9am! I\'ll bring the ceramic add-on samples too.',
      readAt: new Date('2026-06-14T18:10:00.000Z'),
    },
    {
      senderId: alice.id,
      senderType: 'CUSTOMER',
      recipientId: marco.id,
      messageText: 'Car looks amazing, thank you!',
      readAt: null,
    },
  ]);

  await seedMessagesIfMissing(job2.id, [
    {
      senderId: ben.id,
      senderType: 'CUSTOMER',
      recipientId: priya.id,
      messageText: 'Fair warning, there is a LOT of dog hair in the back seats.',
      readAt: new Date('2026-06-19T20:00:00.000Z'),
    },
    {
      senderId: priya.id,
      senderType: 'DETAILER',
      recipientId: ben.id,
      messageText: "No problem, I've got the tools for that. See you at 1pm.",
      readAt: null,
    },
  ]);

  // --- Reviews (one per completed job) ---
  await seedReviewIfMissing({
    jobId: job1.id,
    customerId: alice.customerProfile.id,
    detailerId: marco.detailerProfile.id,
    rating: 5,
    comment: 'Marco was punctual and the car looks brand new. Highly recommend!',
  });

  await seedReviewIfMissing({
    jobId: job2.id,
    customerId: ben.customerProfile.id,
    detailerId: priya.detailerProfile.id,
    rating: 4,
    comment: 'Great job on the interior, minor scheduling delay but worth the wait.',
  });

  // --- Subscriptions (one per detailer) ---
  const subscriptionData = [
    { detailer: marco, plan: 'pro-monthly', status: 'ACTIVE' },
    { detailer: priya, plan: 'starter-monthly', status: 'ACTIVE' },
    { detailer: detailers[2], plan: 'pro-monthly', status: 'PAUSED' },
  ];

  await Promise.all(
    subscriptionData.map(({ detailer, plan, status }) =>
      prisma.subscription.upsert({
        where: { detailerId: detailer.detailerProfile.id },
        update: {},
        create: {
          detailerId: detailer.detailerProfile.id,
          stripeCustomerId: `cus_test_${detailer.firstName.toLowerCase()}`,
          stripeSubscriptionId: `sub_test_${detailer.firstName.toLowerCase()}`,
          plan,
          status,
          currentPeriodStart: new Date('2026-06-01T00:00:00.000Z'),
          currentPeriodEnd: new Date('2026-07-01T00:00:00.000Z'),
        },
      })
    )
  );

  console.log('Seed complete:');
  console.log(`  ${customers.length} customers, ${detailers.length} detailers`);
  console.log('  2 jobs, 5 messages, 2 reviews, 3 subscriptions');
  console.log(`  All seeded users share the password: "${SEED_PASSWORD}"`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
