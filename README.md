# AI Campus Assistant

Full-stack campus assistant web app: a Vite + React frontend with **Supabase** as the real backend for authentication and user profiles.

## Stack

| Layer      | Tech                                              |
| ---------- | ------------------------------------------------- |
| Frontend   | React 18, Vite 6, Tailwind CSS, lucide-react      |
| Auth & DB  | Supabase (Auth + Postgres + Row Level Security)   |
| Backend    | `backend/` folder reserved for future API server  |

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
> **Authentication → Sign In / Up → Email provider → "Confirm email"**. The app handles
> both modes: when "Confirm email" is ON, the user enters a 6-digit verification code right in the website (no email-link redirect needed).

> **Supabase email template note:** Go to **Authentication → Email Templates → "Confirm signup"**
> and make sure the email body includes `{{ .Token }}` so that the 6-digit code is shown to the user.
> Example body:
> ```
> Hi {{ .Email }},
>
> Your verification code is: {{ .Token }}
>
> Enter this code on the website to confirm your account.
> ```

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
```

The `service_role` key is **secret and server-only** — it must never go in the frontend.

---

## How auth works now

- `frontend/src/services/supabase.js` — single shared Supabase client.
- `frontend/src/services/authService.js`:
  - `registerUser` → `supabase.auth.signUp` → the `handle_new_user` trigger creates a `profiles` row.
  - `verifySignupOtp` → `supabase.auth.verifyOtp({ type: 'signup' })` — confirms the account using the 6-digit email code, creates a session, and logs the user in immediately.
  - `loginUser` → `supabase.auth.signInWithPassword` → merges the user with their `profiles` row.
  - `updateUserProfile` → upserts changes into the `profiles` table.
  - `sendPasswordReset` → `supabase.auth.resetPasswordForEmail`.
  - `clearUserSession` → `supabase.auth.signOut`.
- Registration/login returns the same user shape the UI already expects
  (`id, name, email, studentId, role, department, yearLevel, avatarColor, initials, enrolled`).

## Running the app

```bash
cd frontend
npm install
npm run dev
```

## Tests

```bash
cd frontend
node test/auth.test.js
```

Unit tests cover the pure logic + validation paths. Live flows (signup/login/profile)
are exercised manually in the browser once Supabase SQL has been run.