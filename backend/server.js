// server.js — entry point for the DEZE API.
// Boots Express, wires up global middleware, and mounts feature routes.
// Add new route modules under routes/ and register them in routes/index.js.

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import webhookRoutes from './routes/webhooks.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { connectDB, disconnectDB } from './config/database.js';
import { UPLOADS_ROOT } from './utils/upload.js';

const app = express();
const PORT = process.env.PORT || 5001;

// --- Global middleware ---
app.use(cors());

// Serves uploaded photos/documents at /uploads/[subdir]/[filename] — matches
// the URLs returned by controllers/photoController.js.
app.use('/uploads', express.static(UPLOADS_ROOT));

// Stripe verifies webhook signatures against the raw request body, so this
// route must be mounted with express.raw() BEFORE express.json() below.
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRoutes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Health check ---
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'deze-backend' });
});

// --- API routes ---
// All feature routes are mounted under /api/*. See routes/index.js.
app.use('/api', routes);

// --- Error handling (must be registered last) ---
app.use(notFound);
app.use(errorHandler);

// --- Startup ---
// Fail fast if the database isn't reachable rather than accepting requests
// that are guaranteed to error on their first query.
const start = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error('Startup aborted: could not connect to the database.');
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`DEZE backend listening on port ${PORT}`);
  });

  // --- Graceful shutdown ---
  const shutdown = async (signal) => {
    console.log(`${signal} received, shutting down gracefully...`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

start();
