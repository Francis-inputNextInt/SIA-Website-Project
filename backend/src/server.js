/**
 * AI Campus Assistant — Backend Entry Point
 * Loads environment variables and starts the Express server.
 */
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

import { app } from './app.js';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[backend] Server running on port ${PORT}`);
  console.log(`[backend] Health check: http://localhost:${PORT}/api/health`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[backend] Error: Port ${PORT} is already in use. Another instance of the backend server is likely running.`);
    console.error(`[backend] Please stop the other process or set a different PORT in your .env file.`);
    process.exit(1);
  } else {
    console.error('[backend] Server error:', err);
    process.exit(1);
  }
});