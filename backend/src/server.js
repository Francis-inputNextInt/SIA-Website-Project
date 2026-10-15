/**
 * AI Campus Assistant — Backend Entry Point
 * Loads environment variables and starts the Express server.
 */
import 'dotenv/config';
import { app } from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[backend] Server running on http://localhost:${PORT}`);
  console.log(`[backend] Health check: http://localhost:${PORT}/api/health`);
});