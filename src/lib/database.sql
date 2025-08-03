-- Drop tables if they exist to start with a clean slate. 
-- The CASCADE keyword handles dependent objects.
DROP TABLE IF EXISTS public.award_nominations CASCADE;
DROP TABLE IF EXISTS public.awards CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.app_settings CASCADE;
DROP TABLE IF EXISTS public.fyb_week_events CASCADE;


-- Create the students table to hold student profiles.
-- The ID is the primary key and will be provided manually (e.g., from a CSV or student ID).
CREATE TABLE public.students (
    id TEXT PRIMARY KEY NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ,
    name TEXT NOT NULL,
    nickname TEXT,
    best_level TEXT,
    worst_level TEXT,
    favourite_lecturer TEXT,
    relationship_status TEXT,
    alternative_career TEXT,
    best_experience TEXT,
    worst_experience TEXT,
    will_miss TEXT,
    image_src TEXT
);
-- Enable Row Level Security (RLS) for the students table.
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
-- Allow anyone to read all student data.
CREATE POLICY "Allow public read access to students" ON public.students FOR SELECT USING (true);
-- Allow only authenticated users (e.g., admins) to insert, update, or delete.
-- Note: You'll need to configure proper admin roles in Supabase for production security.
CREATE POLICY "Allow admin access to manage students" ON public.students FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');


-- Create the awards table for different voting categories.
CREATE TABLE public.awards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    name TEXT NOT NULL,
    description TEXT
);
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to awards" ON public.awards FOR SELECT USING (true);
CREATE POLICY "Allow admin access to manage awards" ON public.awards FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Create the award_nominations table to link students to awards.
CREATE TABLE public.award_nominations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    award_id UUID REFERENCES public.awards(id) ON DELETE CASCADE,
    student_id TEXT REFERENCES public.students(id) ON DELETE CASCADE,
    votes INT DEFAULT 0 NOT NULL,
    CONSTRAINT unique_award_student_nomination UNIQUE (award_id, student_id)
);
ALTER TABLE public.award_nominations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to nominations" ON public.award_nominations FOR SELECT USING (true);
CREATE POLICY "Allow admin access to manage nominations" ON public.award_nominations FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');


-- Create app_settings table for general application configuration.
-- Using a single row (id=1) to store all settings as a JSONB object.
CREATE TABLE public.app_settings (
    id INT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ,
    logos JSONB,
    voting_settings JSONB,
    fyb_week_settings JSONB,
    profile_template_settings JSONB
);
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to settings" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Allow admin access to manage settings" ON public.app_settings FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');


-- Create fyb_week_events table to store schedule information dynamically.
CREATE TABLE public.fyb_week_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_index INT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    image_src TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
ALTER TABLE public.fyb_week_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to fyb week events" ON public.fyb_week_events FOR SELECT USING (true);
CREATE POLICY "Allow admin access to manage fyb week events" ON public.fyb_week_events FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');


-- Create a storage bucket for public assets like logos.
-- Ensure this is run only once, or handle errors if it already exists.
-- Supabase UI is recommended for creating the bucket if this fails.
INSERT INTO storage.buckets (id, name, public)
VALUES ('app-public-assets', 'app-public-assets', true)
ON CONFLICT (id) DO NOTHING;
-- Create security policies for the storage bucket.
CREATE POLICY "Allow public read access to assets" ON storage.objects FOR SELECT USING (bucket_id = 'app-public-assets');
CREATE POLICY "Allow admin write access to assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'app-public-assets' AND auth.role() = 'authenticated');
CREATE POLICY "Allow admin update access to assets" ON storage.objects FOR UPDATE WITH CHECK (bucket_id = 'app-public-assets' AND auth.role() = 'authenticated');
CREATE POLICY "Allow admin delete access to assets" ON storage.objects FOR DELETE USING (bucket_id = 'app-public-assets' AND auth.role() = 'authenticated');


-- Create a function to increment the vote count on a nomination.
-- This is a more secure way to handle voting.
CREATE OR REPLACE FUNCTION increment_vote(nomination_id_in UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.award_nominations
  SET votes = votes + 1
  WHERE id = nomination_id_in;
END;
$$ LANGUAGE plpgsql;
