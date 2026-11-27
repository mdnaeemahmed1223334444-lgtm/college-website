-- ==============================================================================
-- Migration 007: Student Portal Auth, Classes, Exams, and Results
-- ==============================================================================

-- 1. Extend students table with direct columns for portal authentication & academic history
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS current_password TEXT DEFAULT 'student123';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS academic_session TEXT DEFAULT '2025-2026';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS admission_date DATE;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS registration_number TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS previous_institution TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS document_url TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS document_name TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS rfid_card_data TEXT;

-- Extend staff_profiles table with portal_password for teacher accounts
ALTER TABLE public.staff_profiles ADD COLUMN IF NOT EXISTS portal_password TEXT DEFAULT 'teacher123';

-- Index student_code for fast portal login lookup
CREATE INDEX IF NOT EXISTS idx_students_student_code_lower ON public.students (LOWER(student_code));

-- 2. Class Routines Table (Weekly timetables per batch & group)
CREATE TABLE IF NOT EXISTS public.class_routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
  study_group TEXT, -- 'science', 'business_studies', 'humanities', or NULL for all
  section TEXT,
  day_of_week TEXT NOT NULL, -- 'Sunday', 'Monday', 'Tuesday', etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  subject TEXT NOT NULL,
  teacher_name TEXT,
  room_number TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_class_routines_batch_group ON public.class_routines (batch_id, study_group, day_of_week);

-- 3. Exam Routines Table (Upcoming examination dates & schedules)
CREATE TABLE IF NOT EXISTS public.exam_routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_name TEXT NOT NULL, -- e.g. 'HSC 1st Year Final Exam 2026'
  batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
  study_group TEXT,
  section TEXT,
  subject TEXT NOT NULL,
  exam_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room TEXT,
  instructions TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exam_routines_batch_date ON public.exam_routines (batch_id, exam_date);

-- 4. Exam Results Table (Subject-wise grades and GPA)
CREATE TABLE IF NOT EXISTS public.exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  exam_name TEXT NOT NULL, -- e.g. 'HSC 1st Year Final Exam 2026'
  subject TEXT NOT NULL,
  total_marks NUMERIC DEFAULT 100,
  obtained_marks NUMERIC,
  grade TEXT, -- 'A+', 'A', 'A-', 'B', 'C', 'D', 'F'
  gpa NUMERIC(3,2), -- 5.00, 4.00, etc.
  is_published BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exam_results_student_exam ON public.exam_results (student_id, exam_name);

-- 5. Row-Level Security (RLS)
ALTER TABLE public.class_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'service_role full class_routines') THEN
    CREATE POLICY "service_role full class_routines" ON public.class_routines FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'service_role full exam_routines') THEN
    CREATE POLICY "service_role full exam_routines" ON public.exam_routines FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'service_role full exam_results') THEN
    CREATE POLICY "service_role full exam_results" ON public.exam_results FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Grants
GRANT ALL ON public.class_routines TO service_role, postgres;
GRANT ALL ON public.exam_routines TO service_role, postgres;
GRANT ALL ON public.exam_results TO service_role, postgres;
