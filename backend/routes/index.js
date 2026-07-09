// routes/index.js — central router that aggregates all feature routers.
// As features are built, import and mount their routers here, e.g.:
//
//   import authRoutes from './auth.routes.js';
//   router.use('/auth', authRoutes);

import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'DEZE API root. Feature routes will be mounted here.' });
});

// --- Future routes ---
// router.use('/auth', authRoutes);           // register/login/refresh
// router.use('/users', userRoutes);           // customer + detailer profiles
// router.use('/listings', listingRoutes);     // detailing service listings
// router.use('/bookings', bookingRoutes);     // scheduling & availability
// router.use('/payments', paymentRoutes);     // Stripe checkout/payouts
// router.use('/reviews', reviewRoutes);       // ratings & reviews

export default router;
