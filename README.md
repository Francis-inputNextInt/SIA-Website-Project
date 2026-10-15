# AI Campus Assistant

Full-stack campus assistant web app: a **Vite + React** frontend with an **Express** backend API and **Supabase** for authentication and user profiles.

## Stack

| Layer      | Tech                                              |
| ---------- | ------------------------------------------------- |
| Frontend   | React 18, Vite 6, Tailwind CSS, lucide-react      |
| Backend    | Node.js, Express 4, dotenv, cors                   |
| Auth & DB  | Supabase (Auth + Postgres + Row Level Security)    |

---

## Project Structure

```
project-root/
├── frontend/           # Vite + React SPA
│   ├── src/            # Components, pages, services, data
│   ├── public/         # Static assets (images)
│   ├── package.json
│   ├── vite.config.js  # Dev proxy: /api → localhost:5000
│   └── .env.local      # Supabase anon key + reCAPTCHA key (git-ignored)
│
├── backend/            # Express API server
│   ├── src/            # Server routes, response engine, Supabase admin client
│   ├── package.json
│   ├── .env            # Supabase service_role key + PORT (git-ignored)
│   └── test/           # Backend tests
│
├── .gitignore
└── README.md
```

---

## Supabase Setup (one-time)

### 1. Run this SQL in the Supabase SQL Editor

Open your project → **SQL Editor** → **New query**, then run:

```sql
-- PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users (id) on delete cascade primary key,
  full_name text not null default '',
  email text not null default '',
  student_id text default '',
  role text not null default 'Student',
  department text default '',
  year_level text default '',
  avatar_color text default 'bg-blue-600',
  initials text default '',
  enrolled boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- RLS: users can read their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- RLS: users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Automatically create a profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, student_id, role, department, avatar_color, initials, enrolled)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'student_id', ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'Student'),
    coalesce(new.raw_user_meta_data ->> 'department', ''),
    coalesce(new.raw_user_meta_data ->> 'avatar_color', 'bg-blue-600'),
    coalesce(new.raw_user_meta_data ->> 'initials', ''),
    true
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

> **Tip for local testing:** For frictionless registration during development you can turn off
> **Authentication → Sign In / Up → Email provider → "Confirm email"**. When "Confirm email" is ON, the app prompts the user to check their inbox and click the confirmation link sent by Supabase.
>
> To require email verification via confirmation link:
> 1. **Supabase Dashboard → Project Settings → Authentication → SMTP Settings** → enable a custom SMTP
>    (e.g. Gmail SMTP) so emails are reliably delivered.
> 2. **Supabase Dashboard → Authentication → Providers → Email** → turn **"Confirm email"** ON.
> 3. **Supabase Dashboard → Authentication → URL Configuration** → set **Site URL** to `http://localhost:5173` (or your frontend URL).

### 2. Frontend credentials (`frontend/.env.local`)

```
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Get these from **Settings → API**. The anon key is safe for browser use.
This file is git-ignored — never commit it.

### 3. Backend credentials (`backend/.env`)

```
SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
PORT=5000
```

The `service_role` key is **secret and server-only** — it must never go in the frontend.

---

## Running the App

### Frontend (Vite dev server, port 3000)

```bash
cd frontend
npm install
npm run dev
```

### Backend (Express API server, port 5000)

```bash
cd backend
npm install
npm run dev
```

The frontend Vite dev server automatically proxies `/api` requests to the backend on port 5000, so no CORS issues arise during development.

---

## How Auth Works

All auth logic, database access, and business rules live on the **backend**
(service-role key). The frontend is a thin API client.

- **Backend** — `backend/src/services/authService.js` + `backend/src/controllers/authController.js`:
  - `POST /api/auth/register` → `supabase.auth.signUp` with `emailRedirectTo` → the `handle_new_user` trigger creates a `profiles` row (`needsEmailVerification` returned when emails are on).
  - `POST /api/auth/login` → `supabase.auth.signInWithPassword` (email **or** student/faculty ID) → merges the user with their `profiles` row.
  - `POST /api/auth/forgot-password` → `supabase.auth.resetPasswordForEmail`.
  - `GET /api/auth/me`, `PATCH /api/profile` → token-verified session & profile ownership.
  - Enrollment gate and role rules (personal email → Applicant) are enforced server-side.
- **Frontend** (`frontend/src/services/authService.js`) — thin API client that calls the endpoints above, persists the user object for instant session restore, and hands backend-issued tokens to the anon-key client (`frontend/src/services/supabase.js`) for session persistence + auto-refresh only.
- Registration/login returns the same user shape the UI already expects
  (`id, name, email, studentId, role, department, yearLevel, avatarColor, initials, enrolled`).

## How Chat Works

- **Backend** (`backend/src/data/responseEngine.js`) — the server-side AI response engine (keyword matching, campus knowledge base), served by `POST /api/chat`.
- **Frontend** (`frontend/src/services/chatService.js`) — sends user messages to `POST /api/chat`. There is no local fallback; the UI surfaces a clear error if the backend is unreachable.

---

## Tests

### Frontend tests

```bash
cd frontend
node test/auth.test.js
node test/assistant.test.js
```

### Backend tests

```bash
cd backend
npm test
```

Unit tests cover the pure logic + validation paths. Live flows (signup/login/profile)
are exercised manually in the browser once Supabase SQL has been run.