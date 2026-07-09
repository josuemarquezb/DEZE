// server.js — entry point for the DEZE API.
// Boots Express, wires up global middleware, and mounts feature routes.
// Add new route modules under routes/ and register them in routes/index.js.

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;

// --- Global middleware ---
app.use(cors());
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

app.listen(PORT, () => {
  console.log(`DEZE backend listening on port ${PORT}`);
});
