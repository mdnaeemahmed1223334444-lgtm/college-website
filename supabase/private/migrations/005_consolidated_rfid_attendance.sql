-- ==============================================================================
-- ALL-IN-ONE PRIVATE DATABASE MIGRATION: RFID ATTENDANCE & TESTING SYSTEM
-- Run this in the Supabase SQL Editor of your PRIVATE project.
-- ==============================================================================

-- 1. Ensure students table has RFID columns
alter table if exists public.students add column if not exists rfid_card_id text;
alter table if exists public.students add column if not exists rfid_card_data text;
create index if not exists idx_students_rfid on public.students(rfid_card_id);
create index if not exists idx_students_rfid_data on public.students(rfid_card_data);

-- 2. Create Attendance Devices Table (Authorized scanners & card writers)
create table if not exists public.attendance_devices (
  id uuid primary key default gen_random_uuid(),
  device_id text not null unique,               -- e.g. "GATE-01"
  name text not null,                           -- e.g. "Main Gate Scanner 1"
  secret_token text not null,                   -- Bearer token / API Key for the device
  location text default 'Main Campus Gate',
  is_active boolean not null default true,
  last_seen_at timestamptz,
  pending_write_data text,                      -- Code to burn onto next card
  write_status text default 'idle',             -- 'idle', 'pending', 'success', 'failed'
  last_written_uid text,
  last_written_data text,
  last_written_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_attendance_devices_devid on public.attendance_devices(device_id);

-- 3. Create Student Attendance Records Table (No unique constraint for unlimited test scans!)
create table if not exists public.student_attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  date date not null default (current_date at time zone 'Asia/Dhaka'),
  in_time time not null,
  out_time time,
  status text not null check (status in ('present', 'late', 'absent', 'leave')),
  rfid_card_id text not null,
  device_id text default 'GATE-01',
  scan_timestamp timestamptz not null default now(),
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Drop daily unique constraint if it was created previously (allows unlimited scans in testing phase)
alter table if exists public.student_attendance drop constraint if exists uq_student_daily_attendance;

create index if not exists idx_student_att_date on public.student_attendance(date);
create index if not exists idx_student_att_student on public.student_attendance(student_id);
create index if not exists idx_student_att_rfid on public.student_attendance(rfid_card_id);

-- 4. Create Attendance Settings Table
create table if not exists public.attendance_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Seed initial default device (GATE-01)
insert into public.attendance_devices (device_id, name, secret_token, location, is_active)
values 
  ('GATE-01', 'College Main Gate Scanner', 'dmc_gate01_secret_key_2026', 'Main Entrance Gate', true)
on conflict (device_id) do nothing;

-- Seed default schedule configuration
insert into public.attendance_settings (key, value, description)
values 
  ('entry_start_time', '07:30', 'Gate opens for regular student entry (Asia/Dhaka)'),
  ('late_cutoff_time', '09:15', 'Arrival after this time is marked LATE (Asia/Dhaka)'),
  ('gate_close_time', '12:00', 'Gate scanner closes for entry (Asia/Dhaka)'),
  ('timezone', 'Asia/Dhaka', 'Timezone for daily attendance calculations')
on conflict (key) do update 
set value = excluded.value, updated_at = now();

-- 5. Enable Row Level Security (RLS)
alter table public.attendance_devices enable row level security;
alter table public.student_attendance enable row level security;
alter table public.attendance_settings enable row level security;

-- 6. RLS Policies
drop policy if exists "service_role full access on attendance_devices" on public.attendance_devices;
create policy "service_role full access on attendance_devices" on public.attendance_devices for all to service_role using (true) with check (true);

drop policy if exists "service_role full access on student_attendance" on public.student_attendance;
create policy "service_role full access on student_attendance" on public.student_attendance for all to service_role using (true) with check (true);

drop policy if exists "service_role full access on attendance_settings" on public.attendance_settings;
create policy "service_role full access on attendance_settings" on public.attendance_settings for all to service_role using (true) with check (true);

drop policy if exists "authenticated read student_attendance" on public.student_attendance;
create policy "authenticated read student_attendance" on public.student_attendance for select to authenticated using (true);

drop policy if exists "authenticated read attendance_settings" on public.attendance_settings;
create policy "authenticated read attendance_settings" on public.attendance_settings for select to authenticated using (true);

-- 7. Permissions for service_role and postgres
grant usage on schema public to anon, authenticated, service_role;
grant all on table public.attendance_devices to service_role, postgres;
grant all on table public.student_attendance to service_role, postgres;
grant all on table public.attendance_settings to service_role, postgres;
grant select on table public.student_attendance to authenticated;
grant select on table public.attendance_settings to authenticated;
