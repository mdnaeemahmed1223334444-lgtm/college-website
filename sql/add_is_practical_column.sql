-- Run this in your PRIVATE Supabase database (SQL Editor)
-- This adds the is_practical column to class_routines if it doesn't exist yet.
-- It is safe to run multiple times.

ALTER TABLE class_routines
  ADD COLUMN IF NOT EXISTS is_practical BOOLEAN DEFAULT FALSE;

-- Also ensure is_physical_training exists (should already be there)
ALTER TABLE class_routines
  ADD COLUMN IF NOT EXISTS is_physical_training BOOLEAN DEFAULT FALSE;

-- Refresh schema cache (Supabase does this automatically, but useful after manual changes)
-- You may need to wait 30-60 seconds after running this for the schema cache to refresh.
