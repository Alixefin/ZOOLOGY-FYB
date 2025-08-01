-- Complete SQL script to set up the database from scratch for the Cyber Clan application.

-- 1. Enable UUID extension for auto-generated IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create the table for student profiles
-- The student 'id' is a user-provided text field (e.g., matriculation number), not an auto-generated UUID.
CREATE TABLE
  public.students (
    id TEXT NOT NULL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    name TEXT NOT NULL,
    nickname TEXT NULL,
    best_level TEXT NOT NULL,
    worst_level TEXT NOT NULL,
    favourite_lecturer TEXT NOT NULL,
    relationship_status TEXT NOT NULL,
    alternative_career TEXT NOT NULL,
    best_experience TEXT NOT NULL,
    worst_experience TEXT NOT NULL,
    will_miss TEXT NOT NULL,
    image_src TEXT NULL
  );

-- 3. Create the table for app-wide settings (logos, feature flags)
-- This table will only ever have one row, with a fixed ID of 1.
CREATE TABLE
  public.app_settings (
    id BIGINT NOT NULL PRIMARY KEY DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    logos JSONB NULL,
    voting_settings JSONB NULL,
    fyb_week_settings JSONB NULL
  );

-- 4. Create the table for award categories
CREATE TABLE
  public.awards (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid (),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    name TEXT NOT NULL,
    description TEXT NULL
  );

-- 5. Create the table for award nominations, linking students to awards
CREATE TABLE
  public.award_nominations (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid (),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    award_id UUID NOT NULL REFERENCES public.awards (id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES public.students (id) ON DELETE CASCADE,
    votes BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT unique_award_student_nomination UNIQUE (award_id, student_id)
  );

-- 6. Set up Storage for public assets like logos
INSERT INTO
  storage.buckets (id, name, public)
VALUES
  ('app-public-assets', 'app-public-assets', TRUE) ON CONFLICT (id) DO NOTHING;

-- 7. Define Row Level Security (RLS) policies

-- Enable RLS for all tables
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.award_nominations ENABLE ROW LEVEL SECURITY;

-- Policies for 'students' table
DROP POLICY IF EXISTS "Allow public read access to students" ON public.students;
CREATE POLICY "Allow public read access to students" ON public.students FOR
SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Allow admin full access to students" ON public.students;
CREATE POLICY "Allow admin full access to students" ON public.students FOR ALL USING (TRUE)
WITH
  CHECK (TRUE);

-- Policies for 'app_settings' table
DROP POLICY IF EXISTS "Allow public read access to app_settings" ON public.app_settings;
CREATE POLICY "Allow public read access to app_settings" ON public.app_settings FOR
SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Allow admin full access to app_settings" ON public.app_settings;
CREATE POLICY "Allow admin full access to app_settings" ON public.app_settings FOR ALL USING (TRUE)
WITH
  CHECK (TRUE);

-- Policies for 'awards' table
DROP POLICY IF EXISTS "Allow public read access to awards" ON public.awards;
CREATE POLICY "Allow public read access to awards" ON public.awards FOR
SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Allow admin full access to awards" ON public.awards;
CREATE POLICY "Allow admin full access to awards" ON public.awards FOR ALL USING (TRUE)
WITH
  CHECK (TRUE);

-- Policies for 'award_nominations' table
DROP POLICY IF EXISTS "Allow public read access to nominations" ON public.award_nominations;
CREATE POLICY "Allow public read access to nominations" ON public.award_nominations FOR
SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Allow admin full access to nominations" ON public.award_nominations;
CREATE POLICY "Allow admin full access to nominations" ON public.award_nominations FOR ALL USING (TRUE)
WITH
  CHECK (TRUE);

-- Policies for storage bucket
DROP POLICY IF EXISTS "Allow public read access to app assets" ON storage.objects;
CREATE POLICY "Allow public read access to app assets" ON storage.objects FOR
SELECT
  USING (bucket_id = 'app-public-assets');

DROP POLICY IF EXISTS "Allow admin full access to app assets" ON storage.objects;
CREATE POLICY "Allow admin full access to app assets" ON storage.objects FOR ALL USING (bucket_id = 'app-public-assets')
WITH
  CHECK (bucket_id = 'app-public-assets');

-- 8. Create an RPC function to securely increment votes
CREATE OR REPLACE FUNCTION increment_vote (nomination_id_in UUID) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.award_nominations
  SET votes = votes + 1
  WHERE id = nomination_id_in;
END;
$$;

-- 9. Insert the single, initial row for application settings.
-- This ensures the app has a settings object to work with from the start.
INSERT INTO
  public.app_settings (
    id,
    logos,
    voting_settings,
    fyb_week_settings
  )
VALUES
  (
    1,
    '{"schoolLogo": null, "associationLogo": null, "roastBackground": null}',
    '{"isVotingActive": false}',
    '{"isFybWeekActive": false}'
  ) ON CONFLICT (id) DO
UPDATE
SET
  logos = '{"schoolLogo": null, "associationLogo": null, "roastBackground": null}',
  voting_settings = '{"isVotingActive": false}',
  fyb_week_settings = '{"isFybWeekActive": false}';

-- End of script
