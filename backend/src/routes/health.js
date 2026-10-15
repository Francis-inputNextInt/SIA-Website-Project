/**
 * GET /api/health
 * Returns server status and uptime.
 */
import { Router } from 'express';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

export default router;