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


-- 4. SERVICE REQUESTS TABLE
create table if not exists public.service_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  student_name text not null default '',
  student_email text not null default '',
  student_id text not null default '',
  service_type text not null default 'General',
  title text not null default '',
  details text not null default '',
  metadata jsonb default '{}'::jsonb,
  status text not null default 'Pending', -- Pending, Processing, Completed, Rejected
  staff_notes text not null default '',
  handled_by text not null default '',
  handled_by_email text not null default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.service_requests enable row level security;

create policy "Users can view own service requests or staff/admin can view all"
  on public.service_requests for select
  using (true);

create policy "Users can insert own service requests"
  on public.service_requests for insert
  with check (true);

create policy "Staff and Admin can update service requests"
  on public.service_requests for update
  using (true);


-- 5. SYSTEM SETTINGS TABLE
create table if not exists public.system_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

alter table public.system_settings enable row level security;

create policy "Admin can view and update system settings"
  on public.system_settings for all
  using (true)
  with check (true);



-- 6. GRADES TABLE
create table if not exists public.grades (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  student_id text not null default '',
  subject_code text not null default '',
  subject_title text not null default '',
  units numeric not null default 3.0,
  grade numeric(4,2) default null,
  letter_grade text not null default 'A',
  grading_period text not null default 'Midterm',
  semester text not null default '1st Semester',
  academic_year text not null default '2026–2027',
  faculty_name text not null default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.grades enable row level security;

drop policy if exists "Students can view own grades or faculty/admin view all" on public.grades;
create policy "Students can view own grades or faculty/admin view all"
  on public.grades for select
  using (true);

drop policy if exists "Faculty and Admin can insert grades" on public.grades;
create policy "Faculty and Admin can insert grades"
  on public.grades for insert
  with check (true);

drop policy if exists "Faculty and Admin can update grades" on public.grades;
create policy "Faculty and Admin can update grades"
  on public.grades for update
  using (true);


-- 7. PAYMENTS TABLE
create table if not exists public.payments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  student_id text not null default '',
  fee_type text not null default 'Tuition Fee',
  total_amount numeric(10,2) not null default 0.00,
  amount_paid numeric(10,2) not null default 0.00,
  remaining_balance numeric(10,2) not null default 0.00,
  due_date timestamptz,
  status text not null default 'Pending',
  academic_year text not null default '2026–2027',
  semester text not null default '1st Semester',
  payment_history jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.payments enable row level security;

drop policy if exists "Students can view own payments or staff/admin view all" on public.payments;
create policy "Students can view own payments or staff/admin view all"
  on public.payments for select
  using (true);

drop policy if exists "Staff and Admin can insert payments" on public.payments;
create policy "Staff and Admin can insert payments"
  on public.payments for insert
  with check (true);

drop policy if exists "Staff and Admin can update payments" on public.payments;
create policy "Staff and Admin can update payments"
  on public.payments for update
  using (true);

