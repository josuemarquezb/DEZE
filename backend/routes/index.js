// routes/index.js — central router that aggregates all feature routers.
// Mounted at /api in server.js. The Stripe webhook (routes/webhooks.js) is
// NOT mounted here — it needs a raw request body and is wired up separately
// in server.js, ahead of the global express.json() parser.

import { Router } from 'express';
import authRoutes from './auth.js';
import usersRoutes from './users.js';
import detailersRoutes from './detailers.js';
import jobsRoutes from './jobs.js';
import messagesRoutes from './messages.js';
import paymentsRoutes from './payments.js';
import subscriptionsRoutes from './subscriptions.js';
import reviewsRoutes from './reviews.js';
import adminRoutes from './admin.js';
import photosRoutes from './photos.js';
import notificationsRoutes from './notifications.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'DEZE API root. Feature routes will be mounted here.' });
});

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/detailers', detailersRoutes);
router.use('/jobs', jobsRoutes);
router.use('/messages', messagesRoutes);
router.use('/', paymentsRoutes); // defines its own full /payments/* and /payouts/* paths
router.use('/subscriptions', subscriptionsRoutes);
router.use('/reviews', reviewsRoutes);
router.use('/admin', adminRoutes);
router.use('/photos', photosRoutes);
router.use('/notifications', notificationsRoutes);

export default router;
