-- Drop the students table if it exists
DROP TABLE IF EXISTS public.students CASCADE;

-- Create the students table
CREATE TABLE public.students (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name text NOT NULL,
    nickname text,
    best_level text,
    worst_level text,
    favourite_lecturer text,
    relationship_status text,
    alternative_career text,
    best_experience text,
    worst_experience text,
    will_miss text,
    image_src text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Add comments to the columns
COMMENT ON COLUMN public.students.alternative_career IS 'IF NOT CSC, WHAT COURSE?';

-- Enable Row Level Security
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Create policies for students table
CREATE POLICY "Allow public read access to students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow admin full access to students" ON public.students FOR ALL USING (true); -- Simplified for admin-only CUD
