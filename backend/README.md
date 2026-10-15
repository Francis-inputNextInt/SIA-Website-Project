# Backend

Express API server for the AI Campus Assistant.

## Structure

| `src/server.js`     | Entry point — loads env, starts Express                    |
| `src/app.js`        | Express app (middleware, routes, error handling)           |
| `src/config/`       | Server-side Supabase admin client (`supabase.js`, service_role) |
| `src/services/`     | `authService.js` — all auth + profile business logic       |
| `src/controllers/`  | `authController.js` — HTTP handlers for auth/profile       |
| `src/routes/`       | API routes (`/api/chat`, `/api/auth/*`, `/api/profile`, `/api/health`) |
| `src/data/`         | AI response engine (keyword matching, campus knowledge)    |
| `src/utils/`        | `appError.js` — typed HTTP errors                          |
| `test/`             | Backend unit + integration tests                           |

## Current Responsibilities

- **Chat API** (`POST /api/chat`) — receives a user message, runs the response engine, and returns an assistant reply.
- **Auth API** (`POST /api/auth/register`, `/api/auth/login`, `/api/auth/forgot-password`, `GET /api/auth/me`) — signup, sign-in (email or student/faculty ID), password reset, and token-verified session lookup.
- **Profile API** (`PATCH /api/profile`) — update the caller's own profile; row ownership is enforced from the verified Bearer token.
- **Health check** (`GET /api/health`) — returns server status, uptime, and timestamp.
- **Server-side Supabase client** (`src/config/supabase.js`) — service_role admin client used for ALL auth/DB operations. Requires `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `backend/.env` (optional `FRONTEND_URL` for the password-reset redirect; defaults to `http://localhost:3000`, the frontend's dev port).

## Running the Backend

```bash
cd backend
npm install        # install dependencies
npm run dev        # start with auto-reload (node --watch)
```

The server starts on port `5000` by default (configurable via `PORT` in `.env`).

## Running the Frontend

The frontend (Vite dev server on port 3000) automatically proxies `/api` requests to this backend. Both servers must be running for full functionality. The frontend has no local fallback — if the backend is unavailable it surfaces a clear error message.

```bash
cd ../frontend
npm install
npm run dev
```

## Tests

```bash
npm test    # runs test/responseEngine.test.js && test/authService.test.js
```