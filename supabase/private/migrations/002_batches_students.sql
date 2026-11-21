-- PRIVATE DATABASE (Supabase 2): batches, students, history, transfer logic
-- Run AFTER 001_core.sql.

create type batch_status   as enum ('running', 'passed');
create type study_year     as enum ('first_year', 'second_year');
create type study_group    as enum ('science', 'business_studies', 'humanities');
create type student_status as enum ('active', 'suspended', 'dropped', 'passed_out');
create type gender_type    as enum ('male', 'female', 'other');
create type student_change_kind as enum ('admission', 'transfer', 'group_change', 'status_change');

-- Batch = one HSC exam-year group, e.g. "HSC Batch 26" (exam_year 2026).
create table batches (
  id            uuid primary key default gen_random_uuid(),
  name          text not null unique,                       -- 'HSC Batch 26'
  exam_year     int  not null unique check (exam_year between 2000 and 2100),
  status        batch_status not null default 'running',
  current_year  study_year,                                  -- only while running
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint chk_batch_year check (
    (status = 'running' and current_year is not null) or
    (status = 'passed'  and current_year is null)
  )
);
create trigger trg_batches_updated before update on batches
  for each row execute function set_updated_at();

-- Student master record (text data only; photo = R2 object key).
create table students (
  id             uuid primary key default gen_random_uuid(),
  profile_id     uuid unique references profiles(id) on delete set null,   -- login account (optional)
  student_code   text not null unique,                                      -- college student ID
  full_name      text not null,
  batch_id       uuid not null references batches(id) on delete restrict,
  study_group    study_group not null,
  roll           int,
  section        text,
  status         student_status not null default 'active',
  gender         gender_type,
  date_of_birth  date,
  blood_group    text,
  phone          text,
  email          text,
  address        text,
  father_name    text,
  mother_name    text,
  guardian_name  text,
  guardian_phone text,
  photo_key      text,            -- e.g. private/students/<id>/photo.webp
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index idx_students_batch_group on students(batch_id, study_group);
create index idx_students_status on students(status);
create unique index uq_students_roll on students(batch_id, study_group, roll) where roll is not null;
create trigger trg_students_updated before update on students
  for each row execute function set_updated_at();

-- Audit log of admission / transfer / group change / status change.
create table student_history (
  id             uuid primary key default gen_random_uuid(),
  student_id     uuid not null references students(id) on delete cascade,
  kind           student_change_kind not null,
  from_batch_id  uuid references batches(id) on delete set null,
  to_batch_id    uuid references batches(id) on delete set null,
  from_group     study_group,
  to_group       study_group,
  reason         text,
  changed_by     uuid references profiles(id) on delete set null,
  changed_at     timestamptz not null default now()
);
create index idx_student_history_student on student_history(student_id, changed_at desc);

-- ---------- Transfer / group change (atomic) ----------
-- Moves a student to another RUNNING batch and/or group. Re-activates the student.
-- Pass p_new_roll = null to clear the roll (avoids roll clashes in the new batch).
create or replace function transfer_student(
  p_student uuid, p_to_batch uuid, p_to_group study_group,
  p_new_roll int, p_reason text, p_actor uuid
) returns void language plpgsql as $$
declare
  s students%rowtype;
  b batches%rowtype;
begin
  select * into s from students where id = p_student for update;
  if not found then raise exception 'Student not found'; end if;

  select * into b from batches where id = p_to_batch;
  if not found then raise exception 'Target batch not found'; end if;
  if b.status <> 'running' then raise exception 'Target batch must be running'; end if;

  if p_to_batch = s.batch_id and p_to_group = s.study_group then
    raise exception 'Nothing to change (same batch and group)';
  end if;

  insert into student_history (student_id, kind, from_batch_id, to_batch_id, from_group, to_group, reason, changed_by)
  values (
    p_student,
    (case when p_to_batch <> s.batch_id then 'transfer' else 'group_change' end)::student_change_kind,
    s.batch_id, p_to_batch, s.study_group, p_to_group, p_reason, p_actor
  );

  update students
     set batch_id = p_to_batch, study_group = p_to_group, roll = p_new_roll, status = 'active'
   where id = p_student;
end $$;

-- ---------- Batch status / year (atomic) ----------
-- running needs a year; passed clears it.
-- passed  : active students become passed_out (transfer failed students out first, or after: transfer re-activates them)
-- running : passed_out students become active again
create or replace function set_batch_status(
  p_batch uuid, p_status batch_status, p_year study_year default null
) returns void language plpgsql as $$
begin
  if p_status = 'running' and p_year is null then
    raise exception 'A running batch needs a year (first_year or second_year)';
  end if;

  update batches
     set status = p_status,
         current_year = case when p_status = 'running' then p_year else null end
   where id = p_batch;
  if not found then raise exception 'Batch not found'; end if;

  if p_status = 'passed' then
    update students set status = 'passed_out' where batch_id = p_batch and status = 'active';
  else
    update students set status = 'active' where batch_id = p_batch and status = 'passed_out';
  end if;
end $$;

-- Only the server (service role) may call these.
revoke execute on function transfer_student(uuid, uuid, study_group, int, text, uuid) from public, anon, authenticated;
revoke execute on function set_batch_status(uuid, batch_status, study_year) from public, anon, authenticated;

-- ---------- RLS ----------
-- All reads/writes happen server-side (service role) after a role check:
--   admin = read + write everything, teacher = READ-ONLY on all students, student = own data only.
alter table batches         enable row level security;
alter table students        enable row level security;
alter table student_history enable row level security;

create policy "student reads own row" on students for select using (profile_id = auth.uid());
