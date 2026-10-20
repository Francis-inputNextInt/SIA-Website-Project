-- ============================================================
-- AI CAMPUS ASSISTANT — ADDITIONAL TABLES SQL SCHEMA
-- Run this in your Supabase SQL Editor to support service requests,
-- staff queue processing, announcements, and system audit logs.
-- ============================================================

-- 1. SERVICE REQUESTS TABLE (Student Submissions & Staff/Faculty Processing)
create table if not exists public.service_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  student_name text not null default '',
  student_email text not null default '',
  student_id text default '',
  service_type text not null default 'general',
  title text not null default '',
  details text default '',
  status text not null default 'Pending', -- Pending, Processing, In Review, Approved, Rejected, Completed
  staff_notes text default '',
  handled_by text default '',
  handled_by_email text default '',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS for service_requests
alter table public.service_requests enable row level security;

-- Policies
create policy "Users can view their own service requests or staff can view all"
  on public.service_requests for select
  using (auth.uid() = user_id or exists (
    select 1 from public.profiles where id = auth.uid() and role in ('Staff', 'Faculty', 'Admin')
  ));

create policy "Students can insert their own requests"
  on public.service_requests for insert
  with check (auth.uid() = user_id);

create policy "Staff, Faculty, and Admin can update requests"
  on public.service_requests for update
  using (exists (
    select 1 from public.profiles where id = auth.uid() and role in ('Staff', 'Faculty', 'Admin')
  ));


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

create policy "Enrolled users can view announcements"
  on public.announcements for select
  using (exists (
    select 1 from public.profiles where id = auth.uid() and enrolled = true
  ));

create policy "Faculty, Staff, Admin can post announcements"
  on public.announcements for insert
  with check (exists (
    select 1 from public.profiles where id = auth.uid() and role in ('Faculty', 'Staff', 'Admin')
  ));

create policy "Admin can delete announcements"
  on public.announcements for delete
  using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'Admin'
  ));


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
