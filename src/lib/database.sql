
-- Drop the students table if it exists to ensure a clean slate.
-- CASCADE will remove any dependent objects.
DROP TABLE IF EXISTS public.students CASCADE;

-- Create the students table with a TEXT primary key for manual IDs
CREATE TABLE public.students (
    id TEXT PRIMARY KEY,
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security for the students table
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access to all students
CREATE POLICY "Allow public read access to students"
ON public.students
FOR SELECT
USING (true);

-- Create a policy to allow authenticated users to manage students.
-- In a production app, you would restrict this to a specific admin role.
CREATE POLICY "Allow management of students for authenticated users"
ON public.students
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Add a comment to confirm the table structure
COMMENT ON TABLE public.students IS 'Students table with manual text-based primary key.';
