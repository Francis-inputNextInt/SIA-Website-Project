/**
 * Express Application
 * Configures middleware, routes, and error handling.
 */
import express from 'express';
import cors from 'cors';
import { AppError } from './utils/appError.js';
import chatRouter from './routes/chat.js';
import healthRouter from './routes/health.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import serviceRequestRoutes from './routes/serviceRequestRoutes.js';

export const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────
app.use('/api', healthRouter);
app.use('/api', chatRouter);
app.use('/api', authRoutes);
app.use('/api', profileRoutes);
app.use('/api', serviceRequestRoutes);

// ── 404 handler ────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ── Global error handler ───────────────────────────────────
// AppError instances carry their own HTTP status; anything else is a 500.
app.use((err, _req, res, _next) => {
  const status = err instanceof AppError ? err.status : 500;
  if (status >= 500) {
    console.error('[backend] Unhandled error:', err);
  }
  res.status(status).json({ error: err.message || 'Internal server error' });
});