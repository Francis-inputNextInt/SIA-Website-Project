# Backend

This folder is reserved for the backend / API server of the AI Campus Assistant.

## Structure

| Folder      | Purpose                                                        |
| ----------- | -------------------------------------------------------------- |
| `frontend/` | Vite + React frontend app (auth, chat UI, dashboard)           |
| `backend/`  | Server-side API (to be added — chat/AI endpoints, etc.)        |

## Current status

- **Authentication is now powered by Supabase** (`frontend/src/services/authService.js`):
  - Supabase Auth handles sign-up, sign-in, sessions & password resets.
  - The `profiles` table (created in Supabase via the SQL in the root README) stores the
    extra campus details (name, role, department, year level, enrollment status).
  - Credentials live in `./.env`:
    - `SUPABASE_URL`
    - `SUPABASE_SERVICE_ROLE_KEY` (secret — server-only, git-ignored)
- The chat assistant still uses the frontend mock response system (`src/data/mockResponses.js`).
- Planned backend responsibilities (to be implemented):
  - Chat / AI response endpoints (e.g. OpenAI API integration)
  - Admin / verification endpoints that use the `service_role` key

## Running the frontend

```bash
cd ../frontend
npm install
npm run dev
```