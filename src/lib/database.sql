-- Drop the students table if it exists to ensure a clean slate.
-- CASCADE will also drop any dependent objects like policies or foreign keys.
DROP TABLE IF EXISTS public.students CASCADE;

-- Create the students table with a manual text ID
CREATE TABLE public.students (
  id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  nickname TEXT,
  best_level TEXT NOT NULL,
  worst_level TEXT NOT NULL,
  favourite_lecturer TEXT NOT NULL,
  relationship_status TEXT NOT NULL,
  alternative_career TEXT NOT NULL,
  best_experience TEXT NOT NULL,
  worst_experience TEXT NOT NULL,
  will_miss TEXT NOT NULL,
  image_src TEXT,
  CONSTRAINT students_pkey PRIMARY KEY (id)
);

-- Comments explaining the table structure for clarity.
COMMENT ON COLUMN public.students.id IS 'Manually provided unique identifier for the student (e.g., matriculation number).';
COMMENT ON COLUMN public.students.alternative_career IS 'Stores the answer to "IF NOT CSC, WHAT COURSE?"';


-- =================================================================
-- RLS (Row-Level Security) POLICIES for the students table
-- =================================================================

-- 1. Enable RLS on the table
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- 2. Create policy for public read access
-- This policy allows anyone to view the student records.
CREATE POLICY "Allow public read access to students"
ON public.students
FOR SELECT
USING (true);

-- 3. Create policy for authenticated users (admins) to manage data
-- This policy allows users who are logged in (i.e., authenticated) to insert, update, and delete records.
-- In this app's context, only the admin can log in, so this effectively restricts these actions to the admin.
CREATE POLICY "Allow admin full access to students"
ON public.students
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
