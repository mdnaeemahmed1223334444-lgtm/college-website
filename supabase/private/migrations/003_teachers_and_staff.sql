-- PRIVATE DATABASE MIGRATION 003: Teachers, Staff & Employee Profiles
-- Run in Supabase SQL Editor of the PRIVATE project.

create type staff_role_type as enum ('teacher', 'staff');
create type staff_employment_type as enum ('permanent', 'contractual', 'part_time', 'guest');
create type staff_status_type as enum ('active', 'on_leave', 'suspended', 'retired');

create table if not exists staff_profiles (
  id uuid primary key default gen_random_uuid(),
  employee_id text not null unique,
  full_name text not null,
  bangla_name text,
  role staff_role_type not null default 'teacher',
  designation text not null,
  department text not null,
  email text,
  phone text not null,
  gender text not null default 'male',
  blood_group text not null default 'A+',
  date_of_birth date,
  nid text,
  present_address text,
  permanent_address text,
  highest_degree text not null,
  institution text,
  specialization text,
  experience_years integer default 0,
  joining_date date not null default current_date,
  employment_type staff_employment_type not null default 'permanent',
  status staff_status_type not null default 'active',
  photo_url text,
  bio text,
  room_number text,
  is_head_of_department boolean not null default false,
  is_class_teacher boolean not null default false,
  class_teacher_section text,
  weekly_periods integer not null default 0,
  assigned_subjects text[] default array[]::text[],
  assigned_classes text[] default array[]::text[],
  display_order integer default 0,
  show_on_website boolean not null default true,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_staff_role on staff_profiles(role);
create index if not exists idx_staff_dept on staff_profiles(department);
create index if not exists idx_staff_status on staff_profiles(status);
create index if not exists idx_staff_emp_id on staff_profiles(employee_id);

-- Staff attendance log
create table if not exists staff_attendance (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references staff_profiles(id) on delete cascade,
  date date not null default current_date,
  in_time time,
  out_time time,
  status text not null default 'present',
  remarks text,
  created_at timestamptz not null default now(),
  unique (staff_id, date)
);

create index if not exists idx_staff_att_date on staff_attendance(date);

-- Enable RLS
alter table staff_profiles enable row level security;
alter table staff_attendance enable row level security;

-- Policies
drop policy if exists "Read staff public" on staff_profiles;
create policy "Read staff public" on staff_profiles for select using (true);

drop policy if exists "Service role full access on staff_profiles" on staff_profiles;
create policy "Service role full access on staff_profiles" on staff_profiles for all to service_role using (true) with check (true);

drop policy if exists "Read staff attendance" on staff_attendance;
create policy "Read staff attendance" on staff_attendance for select using (true);

drop policy if exists "Service role full access on staff_attendance" on staff_attendance;
create policy "Service role full access on staff_attendance" on staff_attendance for all to service_role using (true) with check (true);

-- Table Permissions & Grants
grant usage on schema public to anon, authenticated, service_role;

grant all on table public.staff_profiles to postgres, service_role;
grant select on table public.staff_profiles to anon, authenticated;

grant all on table public.staff_attendance to postgres, service_role;
grant select on table public.staff_attendance to authenticated;

grant all on all tables in schema public to postgres, service_role;
grant all on all sequences in schema public to postgres, service_role;
grant all on all routines in schema public to postgres, service_role;

alter default privileges in schema public grant all on tables to postgres, service_role;
alter default privileges in schema public grant all on sequences to postgres, service_role;
alter default privileges in schema public grant all on routines to postgres, service_role;
