-- PRIVATE DATABASE MIGRATION 004: Student Profiles Enhancement & RFID Ready
-- Run in the Supabase SQL Editor of the PRIVATE project.

-- Add missing columns to students table if not present
alter table if exists students add column if not exists bangla_name text;
alter table if exists students add column if not exists permanent_address text;
alter table if exists students add column if not exists father_phone text;
alter table if exists students add column if not exists mother_phone text;
alter table if exists students add column if not exists guardian_relation text;
alter table if exists students add column if not exists photo_url text;
alter table if exists students add column if not exists rfid_card_id text;

-- Create useful indexes
create index if not exists idx_students_rfid on students(rfid_card_id);
create index if not exists idx_students_code on students(student_code);

-- Grant privileges to service_role
grant usage on schema public to anon, authenticated, service_role;
grant all on table public.batches to service_role, postgres;
grant all on table public.students to service_role, postgres;
grant all on table public.student_history to service_role, postgres;

grant select on table public.batches to anon, authenticated;
grant select on table public.students to authenticated;

-- RLS policies for service_role
drop policy if exists "service_role full access on batches" on batches;
create policy "service_role full access on batches" on batches for all to service_role using (true) with check (true);

drop policy if exists "service_role full access on students" on students;
create policy "service_role full access on students" on students for all to service_role using (true) with check (true);

drop policy if exists "service_role full access on student_history" on student_history;
create policy "service_role full access on student_history" on student_history for all to service_role using (true) with check (true);

-- Ensure default batches exist if none present
insert into batches (name, exam_year, status, current_year)
values 
  ('HSC Batch 26', 2026, 'running', 'second_year'),
  ('HSC Batch 27', 2027, 'running', 'first_year')
on conflict (name) do nothing;
