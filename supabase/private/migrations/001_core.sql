-- PRIVATE DATABASE (Supabase 2) : students, teachers, attendance, results, auth
-- Run in the Supabase SQL editor of the PRIVATE project.

create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create type app_role as enum ('admin', 'teacher', 'student');
create type account_status as enum ('active', 'suspended');

-- One row per login account. id = Supabase Auth user id.
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        app_role not null,
  full_name   text not null,
  email       text,
  status      account_status not null default 'active',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index idx_profiles_role on profiles(role);
create trigger trg_profiles_updated before update on profiles
  for each row execute function set_updated_at();

-- Academic sessions (e.g. 2025-2026). Only one can be current.
create table academic_sessions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  start_date  date not null,
  end_date    date not null,
  is_current  boolean not null default false,
  created_at  timestamptz not null default now(),
  check (end_date > start_date)
);
create unique index uq_one_current_session on academic_sessions(is_current) where is_current;

-- ---------- Row Level Security ----------
-- No anonymous access at all. Users may read ONLY their own profile.
-- Everything else is accessed server-side via the service-role key after a role check.
alter table profiles          enable row level security;
alter table academic_sessions enable row level security;

create policy "read own profile" on profiles for select using (auth.uid() = id);
