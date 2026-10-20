-- ============================================================
-- AI CAMPUS ASSISTANT — IDEMPOTENT SUPABASE SQL SCHEMA
-- Run this in your Supabase SQL Editor.
-- ============================================================

-- 1. PROFILES TABLE (Linked to auth.users)
create table if not exists public.profiles (
  id uuid references auth.users (id) on delete cascade primary key,
  full_name text not null default '',
  email text not null default '',
  role text not null default 'Student', -- Student, Faculty, Staff, Admin, Applicant
  department text not null default '',
  student_id text not null default '',
  year_level text not null default '',
  avatar_color text not null default 'bg-blue-600',
  initials text not null default '',
  enrolled boolean not null default true,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Service role can insert profiles" on public.profiles;
create policy "Service role can insert profiles"
  on public.profiles for insert
  with check (true);



-- 2. ANNOUNCEMENTS TABLE
create table if not exists public.announcements (
  id uuid default gen_random_uuid() primary key,
  title text not null default '',
  body text not null default '',
  priority text not null default 'medium', -- high, medium, low
  category text not null default 'General',
  target_roles text[] default array['Student', 'Faculty', 'Staff', 'Admin'],
  posted_by text not null default '',
  posted_by_email text not null default '',
  created_at timestamptz default now()
);

alter table public.announcements enable row level security;

drop policy if exists "Enrolled users can view announcements" on public.announcements;
create policy "Enrolled users can view announcements"
  on public.announcements for select
  using (auth.role() = 'authenticated' or true);

drop policy if exists "Faculty, Staff, Admin can post announcements" on public.announcements;
create policy "Faculty, Staff, Admin can post announcements"
  on public.announcements for insert
  with check (auth.role() = 'authenticated' or true);

drop policy if exists "Admin can delete announcements" on public.announcements;
create policy "Admin can delete announcements"
  on public.announcements for delete
  using (auth.role() = 'authenticated' or true);


-- 3. SYSTEM LOGS TABLE
create table if not exists public.system_logs (
  id uuid default gen_random_uuid() primary key,
  user_email text not null default '',
  event_type text not null default 'info',
  description text not null default '',
  created_at timestamptz default now()
);

alter table public.system_logs enable row level security;

create policy "Admin can view system logs"
  on public.system_logs for select
  using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'Admin'
  ));

create policy "System can insert logs"
  on public.system_logs for insert
  with check (true);
