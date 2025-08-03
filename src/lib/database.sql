-- Drop existing tables with CASCADE to remove dependent objects
DROP TABLE IF EXISTS public.app_settings CASCADE;
DROP TABLE IF EXISTS public.award_nominations CASCADE;
DROP TABLE IF EXISTS public.awards CASCADE;
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
-- Enable Row-Level Security for students table
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
-- Allow public read access to students table
CREATE POLICY "Allow public read access" ON public.students FOR SELECT USING (true);
-- Allow admin users to perform all actions
CREATE POLICY "Allow admin all access" ON public.students FOR ALL USING (true);


-- Create the awards table
CREATE TABLE public.awards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Enable Row-Level Security for awards table
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;
-- Allow public read access to awards table
CREATE POLICY "Allow public read access" ON public.awards FOR SELECT USING (true);
-- Allow admin users to perform all actions
CREATE POLICY "Allow admin all access" ON public.awards FOR ALL USING (true);


-- Create the award_nominations table with a foreign key to students
CREATE TABLE public.award_nominations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    award_id UUID NOT NULL REFERENCES public.awards(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    votes INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(award_id, student_id)
);
-- Enable Row-Level Security for award_nominations table
ALTER TABLE public.award_nominations ENABLE ROW LEVEL SECURITY;
-- Allow public read access to award_nominations table
CREATE POLICY "Allow public read access" ON public.award_nominations FOR SELECT USING (true);
-- Allow admin users to perform all actions
CREATE POLICY "Allow admin all access" ON public.award_nominations FOR ALL USING (true);


-- Create the app_settings table
CREATE TABLE public.app_settings (
    id INT PRIMARY KEY,
    logos JSONB,
    voting_settings JSONB,
    fyb_week_settings JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Enable Row-Level Security for app_settings table
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
-- Allow public read access to app_settings table
CREATE POLICY "Allow public read access" ON public.app_settings FOR SELECT USING (true);
-- Allow admin users to perform all actions
CREATE POLICY "Allow admin all access" ON public.app_settings FOR ALL USING (true);


-- Create a function to increment votes
CREATE OR REPLACE FUNCTION increment_vote(nomination_id_in UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.award_nominations
  SET votes = votes + 1
  WHERE id = nomination_id_in;
END;
$$ LANGUAGE plpgsql;


-- Insert default settings if they don't exist
INSERT INTO public.app_settings (id, logos, voting_settings, fyb_week_settings)
VALUES (1, '{"associationLogo": null, "schoolLogo": null, "roastBackground": null}', '{"isVotingActive": false}', '{"isFybWeekActive": false}')
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('app-public-assets', 'app-public-assets', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/gif'])
ON CONFLICT (id) DO NOTHING;
