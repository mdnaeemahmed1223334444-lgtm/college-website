-- PRIVATE DATABASE MIGRATION 006: RFID Card Data Identification & Multi-Scan Test Mode
-- Run in the Supabase SQL Editor of the PRIVATE project.

-- 1. Add rfid_card_data column to students table (to store custom written text if different from student_code)
alter table if exists students add column if not exists rfid_card_data text;
create index if not exists idx_students_rfid_data on students(rfid_card_data);

-- 2. Drop daily unique constraint to enable unlimited attendance scans during testing phase
alter table if exists student_attendance drop constraint if exists uq_student_daily_attendance;

-- 3. Add remote card-writing coordination columns to attendance_devices
alter table if exists attendance_devices add column if not exists pending_write_data text;
alter table if exists attendance_devices add column if not exists write_status text default 'idle';
alter table if exists attendance_devices add column if not exists last_written_uid text;
alter table if exists attendance_devices add column if not exists last_written_data text;
alter table if exists attendance_devices add column if not exists last_written_at timestamptz;

-- 4. Create card write audit log (optional for history)
create table if not exists rfid_write_logs (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  written_data text not null,
  card_uid text,
  status text not null, -- 'success', 'failed'
  created_at timestamptz not null default now()
);

-- 5. Permissions
grant all on table public.attendance_devices to service_role, postgres;
grant all on table public.student_attendance to service_role, postgres;
grant all on table public.rfid_write_logs to service_role, postgres;
grant select on table public.rfid_write_logs to authenticated;
